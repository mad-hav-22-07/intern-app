import { isSupabaseConfigured } from '@/lib/supabase'
import * as local from '@/lib/forumLocal'
import * as remote from '@/lib/forumRemote'
import type {
  ForumComment,
  ForumPost,
  ListOptions,
  NewCommentInput,
  NewPostInput,
  VoteMap,
  VoteTarget,
} from '@/lib/forumTypes'

/**
 * One async surface over two backends.
 *
 * With `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` set, everything goes to
 * Postgres and updates stream in over Realtime. Without them the same calls hit
 * localStorage, so a fresh clone is still a working forum — just a private one.
 */

export type Author = { name: string; roll: string }

export const isShared = isSupabaseConfigured

export async function listPosts(opts: ListOptions): Promise<ForumPost[]> {
  return isShared ? remote.listPostsRemote(opts) : local.listPostsLocal(opts)
}

export async function topicCounts(): Promise<Record<string, number>> {
  return isShared ? remote.topicCountsRemote() : local.topicCountsLocal()
}

export async function getPost(
  id: string,
): Promise<{ post: ForumPost; comments: ForumComment[] } | null> {
  return isShared ? remote.getPostRemote(id) : local.getPostLocal(id)
}

export async function createPost(input: NewPostInput, author: Author): Promise<ForumPost> {
  return isShared ? remote.createPostRemote(input, author) : local.createPostLocal(input, author)
}

export async function createComment(
  input: NewCommentInput,
  author: Author,
): Promise<ForumComment> {
  return isShared
    ? remote.createCommentRemote(input, author)
    : local.createCommentLocal(input, author)
}

export async function myVotes(): Promise<VoteMap> {
  return isShared ? remote.myVotesRemote() : local.myVotesLocal()
}

export async function vote(target: VoteTarget, value: 1 | -1): Promise<void> {
  if (isShared) await remote.voteRemote(target, value)
  else local.voteLocal(target, value)
}

/** Only the post's author can accept; pass null to clear the accepted answer. */
export async function acceptAnswer(postId: string, commentId: string | null): Promise<void> {
  if (isShared) await remote.acceptAnswerRemote(postId, commentId)
  else local.acceptAnswerLocal(postId, commentId)
}

export async function report(target: VoteTarget, reason?: string): Promise<void> {
  if (isShared) await remote.reportRemote(target, reason)
  else local.reportLocal(target.id)
}

/** Calls `onChange` whenever forum content changes, from any browser. */
export function subscribe(onChange: () => void): () => void {
  return isShared ? remote.subscribeRemote(onChange) : local.subscribeLocal(onChange)
}
