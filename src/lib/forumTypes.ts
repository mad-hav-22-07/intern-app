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
  /** Set the first time the body is changed. */
  editedAt: string | null
  /** Removed by its author but kept as a tombstone so the replies under it survive. */
  deleted: boolean
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
  editedAt: string | null
}

export type SortMode = 'hot' | 'new' | 'top'
export type RangeMode = 'today' | 'week' | 'all'
export type CommentSort = 'best' | 'new' | 'old'

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

export type EditPostInput = {
  title: string
  body: string
  topic: TopicId
  flair: string
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

export const TITLE_MIN = 5
export const TITLE_MAX = 200
export const BODY_MAX = 8000
export const COMMENT_MAX = 4000

/** The placeholder a comment keeps once its author removes it. */
export const DELETED_BODY = '[removed by the author]'

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

/** Flat comment rows -> a reply tree. `sort` applies at every level. */
export function buildCommentTree(
  rows: ForumComment[],
  sort: CommentSort = 'best',
  acceptedId?: string | null,
): ForumComment[] {
  const byId = new Map<string, ForumComment>()
  for (const r of rows) byId.set(r.id, { ...r, replies: [] })

  const roots: ForumComment[] = []
  for (const r of byId.values()) {
    const parent = r.parentId ? byId.get(r.parentId) : undefined
    if (parent) parent.replies.push(r)
    else roots.push(r)
  }

  const age = (c: ForumComment) => Date.parse(c.createdAt)
  const compare = (a: ForumComment, b: ForumComment) => {
    if (sort === 'new') return age(b) - age(a)
    if (sort === 'old') return age(a) - age(b)
    // 'best': score first, oldest wins ties so the original answer stays on top.
    return b.score - a.score || age(a) - age(b)
  }

  const sortDeep = (list: ForumComment[]) => {
    list.sort(compare)
    for (const c of list) sortDeep(c.replies)
  }
  sortDeep(roots)

  // The accepted answer always leads, whatever the sort says.
  if (acceptedId) {
    const i = roots.findIndex((c) => c.id === acceptedId)
    if (i > 0) roots.unshift(roots.splice(i, 1)[0])
  }
  return roots
}

/** Total nodes in a reply subtree, used for the collapse label. */
export function countReplies(c: ForumComment): number {
  return c.replies.reduce((n, r) => n + 1 + countReplies(r), 0)
}
