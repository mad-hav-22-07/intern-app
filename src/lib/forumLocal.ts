import { seedComments, seedPosts } from '@/data/forum'
import { identityKey } from '@/lib/identity'
import {
  DELETED_BODY,
  type EditPostInput,
  type ForumComment,
  type ForumPost,
  type ListOptions,
  type NewCommentInput,
  type NewPostInput,
  type VoteMap,
  type VoteTarget,
} from '@/lib/forumTypes'
import { hotScore, hoursSince } from '@/lib/time'

/**
 * localStorage-backed forum, used when Supabase is not configured.
 *
 * Only user-created rows are persisted. The seed threads are regenerated on every
 * load so their timestamps stay relative to now (otherwise "3h ago" would drift to
 * "9d ago" and the Today tab would empty out). Votes, reports and comments made on
 * seed threads are stored as deltas against them.
 *
 * Because seed rows carry `authorKey: 'seed'`, anything the viewer can edit or
 * delete is by definition one of their own persisted rows, so no delta bookkeeping
 * is needed for those two operations.
 */

const POSTS_KEY = 'ipd.forum.posts.v1'
const COMMENTS_KEY = 'ipd.forum.comments.v1'
const VOTES_KEY = 'ipd.forum.votes.v1'
const DELTA_KEY = 'ipd.forum.score.v1'
const REPORTS_KEY = 'ipd.forum.reports.v1'
const ACCEPTED_KEY = 'ipd.forum.accepted.v1'
const MY_REPORTS_KEY = 'ipd.forum.myreports.v1'

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
    /* storage full or disabled, so the session just won't persist */
  }
}

/** Local writes have no server to push from, so components subscribe to this. */
const listeners = new Set<(info: { self: boolean }) => void>()
function emit() {
  // Every local write originates in this browser, so it is always "self".
  for (const fn of listeners) fn({ self: true })
}
export function subscribeLocal(fn: (info: { self: boolean }) => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

const scoreDeltas = () => read<Record<string, number>>(DELTA_KEY, {})
const acceptedAnswers = () => read<Record<string, string | null>>(ACCEPTED_KEY, {})
const reportCounts = () => read<Record<string, number>>(REPORTS_KEY, {})
const myPosts = () => read<ForumPost[]>(POSTS_KEY, [])
const myComments = () => read<ForumComment[]>(COMMENTS_KEY, [])

/** Older saved rows predate `editedAt` / `deleted`; fill them in on read. */
const normalisePost = (p: ForumPost): ForumPost => ({ ...p, editedAt: p.editedAt ?? null })
const normaliseComment = (c: ForumComment): ForumComment => ({
  ...c,
  editedAt: c.editedAt ?? null,
  deleted: c.deleted ?? false,
})

function allPosts(): ForumPost[] {
  const deltas = scoreDeltas()
  const reports = reportCounts()
  const comments = myComments()
  const accepted = acceptedAnswers()
  const merged = [...myPosts().map(normalisePost), ...seedPosts()]

  return merged.map((p) => ({
    ...p,
    score: p.score + (deltas[p.id] ?? 0),
    reportCount: p.reportCount + (reports[p.id] ?? 0),
    commentCount: p.commentCount + comments.filter((c) => c.postId === p.id).length,
    acceptedCommentId: p.id in accepted ? accepted[p.id] : p.acceptedCommentId,
  }))
}

function allComments(postId: string): ForumComment[] {
  const deltas = scoreDeltas()
  const rows = [
    ...seedComments().filter((c) => c.postId === postId),
    ...myComments()
      .filter((c) => c.postId === postId)
      .map(normaliseComment),
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
    editedAt: null,
  }
  write(POSTS_KEY, [post, ...myPosts()])
  emit()
  return post
}

export function updatePostLocal(id: string, input: EditPostInput): void {
  const now = new Date().toISOString()
  write(
    POSTS_KEY,
    myPosts().map((p) =>
      p.id === id && p.authorKey === identityKey()
        ? {
            ...p,
            title: input.title.trim(),
            body: input.body.trim(),
            topic: input.topic,
            flair: input.flair,
            editedAt: now,
          }
        : p,
    ),
  )
  emit()
}

export function deletePostLocal(id: string): void {
  const mine = myPosts()
  if (!mine.some((p) => p.id === id && p.authorKey === identityKey())) return

  write(POSTS_KEY, mine.filter((p) => p.id !== id))
  write(COMMENTS_KEY, myComments().filter((c) => c.postId !== id))
  emit()
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
    editedAt: null,
    deleted: false,
    replies: [],
  }
  write(COMMENTS_KEY, [...myComments(), comment])
  emit()
  return comment
}

export function updateCommentLocal(id: string, body: string): void {
  const now = new Date().toISOString()
  write(
    COMMENTS_KEY,
    myComments().map((c) =>
      c.id === id && c.authorKey === identityKey()
        ? { ...c, body: body.trim(), editedAt: now }
        : c,
    ),
  )
  emit()
}

/**
 * Removing a comment that has replies would orphan them, so those become
 * tombstones instead and only childless comments are actually dropped.
 */
export function deleteCommentLocal(id: string): void {
  const rows = myComments()
  const target = rows.find((c) => c.id === id && c.authorKey === identityKey())
  if (!target) return

  const hasReplies = rows.some((c) => c.parentId === id)
  write(
    COMMENTS_KEY,
    hasReplies
      ? rows.map((c) =>
          c.id === id ? { ...c, body: DELETED_BODY, deleted: true, editedAt: null } : c,
        )
      : rows.filter((c) => c.id !== id),
  )
  emit()
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
  // Deliberately no emit(): the caller already applies the score delta optimistically,
  // and a reload here would briefly double-count it.
  return votes
}

export function acceptAnswerLocal(postId: string, commentId: string | null): void {
  const post = allPosts().find((p) => p.id === postId)
  if (!post || post.authorKey !== identityKey()) return

  write(ACCEPTED_KEY, { ...acceptedAnswers(), [postId]: commentId })
  emit()
}

export function myReportsLocal(): string[] {
  return read<string[]>(MY_REPORTS_KEY, [])
}

export function reportLocal(targetId: string): void {
  const mine = myReportsLocal()
  if (mine.includes(targetId)) return

  write(MY_REPORTS_KEY, [...mine, targetId])
  const counts = reportCounts()
  counts[targetId] = (counts[targetId] ?? 0) + 1
  write(REPORTS_KEY, counts)
  emit()
}

/** Counts for the profile page. */
export function myStatsLocal(): { posts: number; comments: number; karma: number } {
  const me = identityKey()
  const posts = myPosts().filter((p) => p.authorKey === me)
  const comments = myComments().filter((c) => c.authorKey === me && !c.deleted)
  const deltas = scoreDeltas()
  const karma = [...posts, ...comments].reduce(
    (sum, row) => sum + row.score + (deltas[row.id] ?? 0),
    0,
  )
  return { posts: posts.length, comments: comments.length, karma }
}
