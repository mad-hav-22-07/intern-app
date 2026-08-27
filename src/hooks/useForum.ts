import { useCallback, useEffect, useRef, useState } from 'react'
import * as api from '@/lib/forumApi'
import type {
  ForumComment,
  ForumPost,
  ListOptions,
  VoteMap,
  VoteTarget,
} from '@/lib/forumTypes'
import { buildCommentTree } from '@/lib/forumTypes'

const message = (e: unknown) =>
  e instanceof Error ? e.message : 'Something went wrong talking to the forum.'

/**
 * The post list, plus the "N new posts" pill.
 *
 * Realtime inserts are *not* spliced into the visible list — that would make rows
 * jump under the reader's cursor. They raise `pending` instead, and the reader
 * decides when to pull them in.
 */
export function useForumList(opts: ListOptions) {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(0)

  // Kept in a ref so the realtime subscription doesn't need to re-bind per keystroke.
  const optsRef = useRef(opts)
  optsRef.current = opts

  const load = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setLoading(true)
    try {
      const [rows, topicCounts] = await Promise.all([
        api.listPosts(optsRef.current),
        api.topicCounts(),
      ])
      setPosts(rows)
      setCounts(topicCounts)
      setPending(0)
      setError(null)
    } catch (e) {
      setError(message(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(true)
  }, [load, opts.topic, opts.range, opts.sort, opts.query])

  useEffect(() => api.subscribe(() => setPending((n) => n + 1)), [])

  return {
    posts,
    counts,
    loading,
    error,
    pending,
    refresh: () => load(false),
  }
}

/** One thread: the post, its comment tree, and this browser's votes. */
export function useForumThread(postId: string | undefined) {
  const [post, setPost] = useState<ForumPost | null>(null)
  const [comments, setComments] = useState<ForumComment[]>([])
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (showSpinner: boolean) => {
      if (!postId) return
      if (showSpinner) setLoading(true)
      try {
        const result = await api.getPost(postId)
        if (!result) {
          setMissing(true)
        } else {
          setPost(result.post)
          setComments(buildCommentTree(result.comments))
          setMissing(false)
        }
        setError(null)
      } catch (e) {
        setError(message(e))
      } finally {
        setLoading(false)
      }
    },
    [postId],
  )

  useEffect(() => {
    void load(true)
  }, [load])

  useEffect(() => api.subscribe(() => void load(false)), [load])

  return { post, comments, loading, missing, error, refresh: () => load(false) }
}

/**
 * Vote state for the whole page. Updates optimistically and rolls back if the
 * write fails, so a click always feels instant.
 */
export function useVotes() {
  const [votes, setVotes] = useState<VoteMap>({})

  useEffect(() => {
    void api
      .myVotes()
      .then(setVotes)
      .catch(() => setVotes({}))
  }, [])

  const cast = useCallback(
    async (target: VoteTarget, value: 1 | -1): Promise<number> => {
      // VoteMap is a plain Record, so indexing it types as 1 | -1 — assert the
      // miss case back in or the `=== 0` checks below look unreachable to TS.
      const stored = votes[target.id] as 1 | -1 | undefined
      const previous: 1 | -1 | 0 = stored ?? 0
      const next: 1 | -1 | 0 = previous === value ? 0 : value

      setVotes((v) => {
        const copy = { ...v }
        if (next === 0) delete copy[target.id]
        else copy[target.id] = next
        return copy
      })

      try {
        await api.vote(target, value)
      } catch {
        setVotes((v) => {
          const copy = { ...v }
          if (previous === 0) delete copy[target.id]
          else copy[target.id] = previous as 1 | -1
          return copy
        })
        return 0
      }
      return next - previous
    },
    [votes],
  )

  return { votes, cast }
}
