import { seedComments, seedPosts } from '@/data/forum'
import { identityKey } from '@/lib/identity'
import type {
  ForumComment,
  ForumPost,
  ListOptions,
  NewCommentInput,
  NewPostInput,
  VoteMap,
  VoteTarget,
} from '@/lib/forumTypes'
import { hotScore, hoursSince } from '@/lib/time'

/**
 * localStorage-backed forum, used when Supabase is not configured.
 *
 * Only user-created rows are persisted. The seed threads are regenerated on every
 * load so their timestamps stay relative to now (otherwise "3h ago" would drift to
 * "9d ago" and the Today tab would empty out). Votes, reports and comments made on
 * seed threads are stored as deltas against them.
 */

const POSTS_KEY = 'ipd.forum.posts.v1'
const COMMENTS_KEY = 'ipd.forum.comments.v1'
const VOTES_KEY = 'ipd.forum.votes.v1'
const DELTA_KEY = 'ipd.forum.score.v1'
const REPORTS_KEY = 'ipd.forum.reports.v1'
const ACCEPTED_KEY = 'ipd.forum.accepted.v1'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or disabled — the session just won't persist */
  }
}

/** Local writes have no server to push from, so components subscribe to this. */
const listeners = new Set<() => void>()
function emit() {
  for (const fn of listeners) fn()
}
export function subscribeLocal(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

const scoreDeltas = () => read<Record<string, number>>(DELTA_KEY, {})
const acceptedAnswers = () => read<Record<string, string | null>>(ACCEPTED_KEY, {})
const reportCounts = () => read<Record<string, number>>(REPORTS_KEY, {})

function allPosts(): ForumPost[] {
  const deltas = scoreDeltas()
  const reports = reportCounts()
  const userComments = read<ForumComment[]>(COMMENTS_KEY, [])
  const accepted = acceptedAnswers()
  const merged = [...read<ForumPost[]>(POSTS_KEY, []), ...seedPosts()]

  return merged.map((p) => ({
    ...p,
    score: p.score + (deltas[p.id] ?? 0),
    reportCount: p.reportCount + (reports[p.id] ?? 0),
    commentCount: p.commentCount + userComments.filter((c) => c.postId === p.id).length,
    acceptedCommentId: p.id in accepted ? accepted[p.id] : p.acceptedCommentId,
  }))
}

function allComments(postId: string): ForumComment[] {
  const deltas = scoreDeltas()
  const rows = [
    ...seedComments().filter((c) => c.postId === postId),
    ...read<ForumComment[]>(COMMENTS_KEY, []).filter((c) => c.postId === postId),
  ]
  return rows.map((c) => ({ ...c, score: c.score + (deltas[c.id] ?? 0), replies: [] }))
}

export function listPostsLocal(opts: ListOptions): ForumPost[] {
  let out = allPosts()

  if (opts.topic !== 'all') out = out.filter((p) => p.topic === opts.topic)
  if (opts.range === 'today') out = out.filter((p) => hoursSince(p.createdAt) <= 24)
  if (opts.range === 'week') out = out.filter((p) => hoursSince(p.createdAt) <= 24 * 7)

  const q = opts.query.trim().toLowerCase()
  if (q) {
    out = out.filter(
      (p) => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q),
    )
  }

  const rank = (p: ForumPost) =>
    opts.sort === 'new'
      ? Date.parse(p.createdAt)
      : opts.sort === 'top'
        ? p.score
        : hotScore(p.score, p.createdAt)

  return [...out].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || rank(b) - rank(a),
  )
}

export function topicCountsLocal(): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const p of allPosts()) counts[p.topic] = (counts[p.topic] ?? 0) + 1
  return counts
}

export function getPostLocal(id: string): { post: ForumPost; comments: ForumComment[] } | null {
  const post = allPosts().find((p) => p.id === id)
  return post ? { post, comments: allComments(id) } : null
}

export function createPostLocal(
  input: NewPostInput,
  author: { name: string; roll: string },
): ForumPost {
  const post: ForumPost = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    body: input.body.trim(),
    topic: input.topic,
    flair: input.flair,
    authorName: author.name,
    authorRoll: author.roll,
    authorKey: identityKey(),
    isAnonymous: input.isAnonymous,
    pinned: false,
    score: 0,
    commentCount: 0,
    reportCount: 0,
    acceptedCommentId: null,
    createdAt: new Date().toISOString(),
  }
  write(POSTS_KEY, [post, ...read<ForumPost[]>(POSTS_KEY, [])])
  emit()
  return post
}

export function createCommentLocal(
  input: NewCommentInput,
  author: { name: string; roll: string },
): ForumComment {
  const comment: ForumComment = {
    id: crypto.randomUUID(),
    postId: input.postId,
    parentId: input.parentId,
    body: input.body.trim(),
    authorName: author.name,
    authorRoll: author.roll,
    authorKey: identityKey(),
    isAnonymous: input.isAnonymous,
    score: 0,
    createdAt: new Date().toISOString(),
    replies: [],
  }
  write(COMMENTS_KEY, [...read<ForumComment[]>(COMMENTS_KEY, []), comment])
  emit()
  return comment
}

export function myVotesLocal(): VoteMap {
  return read<VoteMap>(VOTES_KEY, {})
}

/** Toggle semantics: voting the same way twice clears the vote. */
export function voteLocal(target: VoteTarget, value: 1 | -1): VoteMap {
  const votes = myVotesLocal()
  const deltas = scoreDeltas()
  const previous = votes[target.id] ?? 0
  const next = previous === value ? 0 : value

  deltas[target.id] = (deltas[target.id] ?? 0) + (next - previous)
  if (next === 0) delete votes[target.id]
  else votes[target.id] = next

  write(VOTES_KEY, votes)
  write(DELTA_KEY, deltas)
  emit()
  return votes
}

export function acceptAnswerLocal(postId: string, commentId: string | null): void {
  const post = allPosts().find((p) => p.id === postId)
  if (!post || post.authorKey !== identityKey()) return

  write(ACCEPTED_KEY, { ...acceptedAnswers(), [postId]: commentId })
  emit()
}

export function myReportsLocal(): string[] {
  return read<string[]>('ipd.forum.myreports.v1', [])
}

export function reportLocal(targetId: string): void {
  const mine = myReportsLocal()
  if (mine.includes(targetId)) return

  write('ipd.forum.myreports.v1', [...mine, targetId])
  const counts = reportCounts()
  counts[targetId] = (counts[targetId] ?? 0) + 1
  write(REPORTS_KEY, counts)
  emit()
}
