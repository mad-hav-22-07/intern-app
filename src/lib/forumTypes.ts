import type { RoleId } from '@/data/roles'

export type TopicId = RoleId | 'general'

export type Flair =
  | 'Question'
  | 'Interview Experience'
  | 'Resource'
  | 'Looking for partner'
  | 'Discussion'
  | 'Megathread'
  | 'Resume'
  | 'Spam'

export const FLAIRS: Flair[] = [
  'Question',
  'Interview Experience',
  'Resource',
  'Looking for partner',
  'Discussion',
]

export type ForumComment = {
  id: string
  postId: string
  parentId: string | null
  body: string
  authorName: string
  authorRoll: string
  authorKey: string
  isAnonymous: boolean
  score: number
  createdAt: string
  /** Built client-side from parentId — the table itself is flat. */
  replies: ForumComment[]
}

export type ForumPost = {
  id: string
  title: string
  body: string
  topic: TopicId
  flair: string
  authorName: string
  authorRoll: string
  authorKey: string
  isAnonymous: boolean
  pinned: boolean
  score: number
  commentCount: number
  reportCount: number
  acceptedCommentId: string | null
  createdAt: string
}

export type SortMode = 'hot' | 'new' | 'top'
export type RangeMode = 'today' | 'week' | 'all'

export type ListOptions = {
  topic: TopicId | 'all'
  range: RangeMode
  sort: SortMode
  query: string
}

export type NewPostInput = {
  title: string
  body: string
  topic: TopicId
  flair: string
  isAnonymous: boolean
}

export type NewCommentInput = {
  postId: string
  parentId: string | null
  body: string
  isAnonymous: boolean
}

/** target id -> this browser's vote on it */
export type VoteMap = Record<string, 1 | -1>

export type VoteTarget = { kind: 'post' | 'comment'; id: string }

/** How many reports before a post shows the moderation banner. */
export const REPORT_THRESHOLD = 3

export const ANON_NAME = 'Anonymous'
export const ANON_ROLL = 'hidden'

/** Posts and comments store the real author; the UI masks it when is_anonymous. */
export function displayAuthor(x: {
  authorName: string
  authorRoll: string
  isAnonymous: boolean
}): { name: string; roll: string } {
  return x.isAnonymous
    ? { name: ANON_NAME, roll: ANON_ROLL }
    : { name: x.authorName, roll: x.authorRoll }
}

/** Flat comment rows -> a reply tree, oldest first at every level. */
export function buildCommentTree(rows: ForumComment[]): ForumComment[] {
  const byId = new Map<string, ForumComment>()
  for (const r of rows) byId.set(r.id, { ...r, replies: [] })

  const roots: ForumComment[] = []
  for (const r of byId.values()) {
    const parent = r.parentId ? byId.get(r.parentId) : undefined
    if (parent) parent.replies.push(r)
    else roots.push(r)
  }

  const byAge = (a: ForumComment, b: ForumComment) =>
    Date.parse(a.createdAt) - Date.parse(b.createdAt)
  const sortDeep = (list: ForumComment[]) => {
    list.sort(byAge)
    for (const c of list) sortDeep(c.replies)
  }
  sortDeep(roots)
  return roots
}

/** Total nodes in a reply subtree, used for the collapse label. */
export function countReplies(c: ForumComment): number {
  return c.replies.reduce((n, r) => n + 1 + countReplies(r), 0)
}
