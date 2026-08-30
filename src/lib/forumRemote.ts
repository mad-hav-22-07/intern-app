import { requireSupabase } from '@/lib/supabase'
import { identityKey } from '@/lib/identity'
import type {
  EditPostInput,
  ForumComment,
  ForumPost,
  ListOptions,
  NewCommentInput,
  NewPostInput,
  VoteMap,
  VoteTarget,
} from '@/lib/forumTypes'
import { hotScore } from '@/lib/time'

type PostRow = {
  id: string
  title: string
  body: string
  topic: string
  flair: string
  author_name: string
  author_roll: string
  author_key: string
  is_anonymous: boolean
  pinned: boolean
  score: number
  comment_count: number
  report_count: number
  accepted_comment_id: string | null
  created_at: string
  edited_at: string | null
}

type CommentRow = {
  id: string
  post_id: string
  parent_id: string | null
  body: string
  author_name: string
  author_roll: string
  author_key: string
  is_anonymous: boolean
  score: number
  created_at: string
  edited_at: string | null
  deleted: boolean
}

const POST_COLUMNS =
  'id,title,body,topic,flair,author_name,author_roll,author_key,is_anonymous,pinned,score,comment_count,report_count,accepted_comment_id,created_at,edited_at'

/** Ranking happens client-side, so this caps how many rows that can consider. */
const PAGE_SIZE = 200

const COMMENT_COLUMNS =
  'id,post_id,parent_id,body,author_name,author_roll,author_key,is_anonymous,score,created_at,edited_at,deleted'

const toPost = (r: PostRow): ForumPost => ({
  id: r.id,
  title: r.title,
  body: r.body,
  topic: r.topic as ForumPost['topic'],
  flair: r.flair,
  authorName: r.author_name,
  authorRoll: r.author_roll,
  authorKey: r.author_key,
  isAnonymous: r.is_anonymous,
  pinned: r.pinned,
  score: r.score,
  commentCount: r.comment_count,
  reportCount: r.report_count,
  acceptedCommentId: r.accepted_comment_id,
  createdAt: r.created_at,
  editedAt: r.edited_at,
})

const toComment = (r: CommentRow): ForumComment => ({
  id: r.id,
  postId: r.post_id,
  parentId: r.parent_id,
  body: r.body,
  authorName: r.author_name,
  authorRoll: r.author_roll,
  authorKey: r.author_key,
  isAnonymous: r.is_anonymous,
  score: r.score,
  createdAt: r.created_at,
  editedAt: r.edited_at,
  deleted: r.deleted ?? false,
  replies: [],
})

export async function listPostsRemote(opts: ListOptions): Promise<ForumPost[]> {
  const sb = requireSupabase()
  let q = sb.from('forum_posts').select(POST_COLUMNS)

  if (opts.topic !== 'all') q = q.eq('topic', opts.topic)

  if (opts.range !== 'all') {
    const hours = opts.range === 'today' ? 24 : 24 * 7
    q = q.gte('created_at', new Date(Date.now() - hours * 3_600_000).toISOString())
  }

  const term = opts.query.trim()
  if (term) {
    // websearch_to_tsquery tolerates the way people actually type into a search box.
    q = q.textSearch('search', term, { type: 'websearch', config: 'english' })
  }

  // 'top' orders in SQL. 'new' and 'hot' both want recent rows: hot's age decay
  // can't be expressed through PostgREST, so pull the most recent PAGE_SIZE and
  // rank client-side — ordering hot by score instead would bury the new posts hot
  // exists to surface.
  q =
    opts.sort === 'top'
      ? q.order('score', { ascending: false })
      : q.order('created_at', { ascending: false })
  q = q.limit(PAGE_SIZE)

  const { data, error } = await q
  if (error) throw error

  const posts = (data as PostRow[]).map(toPost)
  const rank = (p: ForumPost) =>
    opts.sort === 'new'
      ? Date.parse(p.createdAt)
      : opts.sort === 'top'
        ? p.score
        : hotScore(p.score, p.createdAt)

  return posts.sort((a, b) => Number(b.pinned) - Number(a.pinned) || rank(b) - rank(a))
}

export async function topicCountsRemote(): Promise<Record<string, number>> {
  const sb = requireSupabase()
  const { data, error } = await sb.from('forum_posts').select('topic')
  if (error) throw error

  const counts: Record<string, number> = {}
  for (const row of data as { topic: string }[]) {
    counts[row.topic] = (counts[row.topic] ?? 0) + 1
  }
  return counts
}

export async function getPostRemote(
  id: string,
): Promise<{ post: ForumPost; comments: ForumComment[] } | null> {
  const sb = requireSupabase()

  const [postRes, commentRes] = await Promise.all([
    sb.from('forum_posts').select(POST_COLUMNS).eq('id', id).maybeSingle(),
    sb.from('forum_comments').select(COMMENT_COLUMNS).eq('post_id', id).order('created_at'),
  ])

  if (postRes.error) throw postRes.error
  if (commentRes.error) throw commentRes.error
  if (!postRes.data) return null

  return {
    post: toPost(postRes.data as PostRow),
    comments: (commentRes.data as CommentRow[]).map(toComment),
  }
}

export async function createPostRemote(
  input: NewPostInput,
  author: { name: string; roll: string },
): Promise<ForumPost> {
  const sb = requireSupabase()
  const { data, error } = await sb
    .from('forum_posts')
    .insert({
      title: input.title.trim(),
      body: input.body.trim(),
      topic: input.topic,
      flair: input.flair,
      author_name: author.name,
      author_roll: author.roll,
      author_key: identityKey(),
      is_anonymous: input.isAnonymous,
    })
    .select(POST_COLUMNS)
    .single()

  if (error) throw error
  return toPost(data as PostRow)
}

export async function createCommentRemote(
  input: NewCommentInput,
  author: { name: string; roll: string },
): Promise<ForumComment> {
  const sb = requireSupabase()
  const { data, error } = await sb
    .from('forum_comments')
    .insert({
      post_id: input.postId,
      parent_id: input.parentId,
      body: input.body.trim(),
      author_name: author.name,
      author_roll: author.roll,
      author_key: identityKey(),
      is_anonymous: input.isAnonymous,
    })
    .select(COMMENT_COLUMNS)
    .single()

  if (error) throw error
  return toComment(data as CommentRow)
}

export async function updatePostRemote(id: string, input: EditPostInput): Promise<void> {
  const sb = requireSupabase()
  const { error } = await sb.rpc('forum_edit_post', {
    p_post: id,
    p_actor: identityKey(),
    p_title: input.title.trim(),
    p_body: input.body.trim(),
    p_topic: input.topic,
    p_flair: input.flair,
  })
  if (error) throw error
}

export async function deletePostRemote(id: string): Promise<void> {
  const sb = requireSupabase()
  const { error } = await sb.rpc('forum_delete_post', { p_post: id, p_actor: identityKey() })
  if (error) throw error
}

export async function updateCommentRemote(id: string, body: string): Promise<void> {
  const sb = requireSupabase()
  const { error } = await sb.rpc('forum_edit_comment', {
    p_comment: id,
    p_actor: identityKey(),
    p_body: body.trim(),
  })
  if (error) throw error
}

export async function deleteCommentRemote(id: string): Promise<void> {
  const sb = requireSupabase()
  const { error } = await sb.rpc('forum_delete_comment', {
    p_comment: id,
    p_actor: identityKey(),
  })
  if (error) throw error
}

/** Post / comment / karma totals for this browser's key. */
export async function myStatsRemote(): Promise<{
  posts: number
  comments: number
  karma: number
}> {
  const sb = requireSupabase()
  const me = identityKey()
  const [posts, comments] = await Promise.all([
    sb.from('forum_posts').select('score').eq('author_key', me),
    sb.from('forum_comments').select('score').eq('author_key', me).eq('deleted', false),
  ])
  if (posts.error) throw posts.error
  if (comments.error) throw comments.error

  const rows = [...(posts.data ?? []), ...(comments.data ?? [])] as { score: number }[]
  return {
    posts: posts.data?.length ?? 0,
    comments: comments.data?.length ?? 0,
    karma: rows.reduce((sum, r) => sum + r.score, 0),
  }
}

export async function myVotesRemote(): Promise<VoteMap> {
  const sb = requireSupabase()
  const { data, error } = await sb.rpc('forum_my_votes', { p_voter: identityKey() })
  if (error) throw error

  const map: VoteMap = {}
  for (const row of (data ?? []) as { post_id: string | null; comment_id: string | null; value: 1 | -1 }[]) {
    const id = row.post_id ?? row.comment_id
    if (id) map[id] = row.value
  }
  return map
}

/** Returns the target's new score. Toggle semantics live in the RPC. */
export async function voteRemote(target: VoteTarget, value: 1 | -1): Promise<number> {
  const sb = requireSupabase()
  const { data, error } = await sb.rpc('forum_vote', {
    p_voter: identityKey(),
    p_value: value,
    p_post: target.kind === 'post' ? target.id : null,
    p_comment: target.kind === 'comment' ? target.id : null,
  })
  if (error) throw error
  return (data as number) ?? 0
}

/** Ownership is checked inside the RPC — pass null to clear. */
export async function acceptAnswerRemote(
  postId: string,
  commentId: string | null,
): Promise<void> {
  const sb = requireSupabase()
  const { error } = await sb.rpc('forum_accept_answer', {
    p_post: postId,
    p_actor: identityKey(),
    p_comment: commentId,
  })
  if (error) throw error
}

export async function reportRemote(target: VoteTarget, reason = 'other'): Promise<void> {
  const sb = requireSupabase()
  const { error } = await sb.from('forum_reports').insert({
    reporter_key: identityKey(),
    post_id: target.kind === 'post' ? target.id : null,
    comment_id: target.kind === 'comment' ? target.id : null,
    reason,
  })
  // 23505 = already reported by this browser. Not an error worth surfacing.
  if (error && error.code !== '23505') throw error
}

/**
 * Fires `onChange` when anyone writes a post or comment. `info.self` is true when
 * the change came from this browser, so the caller can fold its own writes in
 * silently instead of showing a "new updates" pill for them.
 */
export function subscribeRemote(onChange: (info: { self: boolean }) => void): () => void {
  const sb = requireSupabase()
  const me = identityKey()

  const handle = (payload: { new?: Record<string, unknown>; old?: Record<string, unknown> }) => {
    const row = payload.new ?? payload.old ?? {}
    onChange({ self: row.author_key === me })
  }

  const channel = sb
    .channel('forum-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_posts' }, handle)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_comments' }, handle)
    .subscribe()

  return () => {
    void sb.removeChannel(channel)
  }
}
