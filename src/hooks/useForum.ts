import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as api from '@/lib/forumApi'
import type {
  CommentSort,
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
 * Realtime inserts from *other* people are not spliced into the visible list;
 * that would make rows jump under the reader's cursor. They raise `pending`
 * instead, and the reader decides when to pull them in. Changes this browser
 * made are folded in silently, because the reader already knows about those.
 */
export function useForumList(opts: ListOptions) {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(0)

  // Kept in a ref so the realtime subscription doesn't need to re-bind per keystroke.
  const optsRef = useRef(opts)
  optsRef.current = opts
  const firstLoad = useRef(true)

  const load = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setLoading(true)
    else setBusy(true)
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
      setBusy(false)
      firstLoad.current = false
    }
  }, [])

  // Skeletons only on the very first load. Later filter changes swap the rows in
  // place. Replacing a full list with skeletons on every keystroke reads as a
  // page flash, not as progress.
  useEffect(() => {
    void load(firstLoad.current)
  }, [load, opts.topic, opts.range, opts.sort, opts.query])

  useEffect(
    () =>
      api.subscribe((info) => {
        if (info.self) void load(false)
        else setPending((n) => n + 1)
      }),
    [load],
  )

  /** Applies a vote's effect to one row without refetching and reordering the list. */
  const patchScore = useCallback((postId: string, delta: number) => {
    if (!delta) return
    setPosts((rows) => rows.map((p) => (p.id === postId ? { ...p, score: p.score + delta } : p)))
  }, [])

  return {
    posts,
    counts,
    loading,
    busy,
    error,
    pending,
    patchScore,
    refresh: () => load(false),
  }
}

/** One thread: the post, its comment tree, and this browser's votes. */
export function useForumThread(postId: string | undefined, sort: CommentSort) {
  const [post, setPost] = useState<ForumPost | null>(null)
  const [rows, setRows] = useState<ForumComment[]>([])
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
          setRows(result.comments)
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

  // Re-sorting is a pure view concern: no refetch, so switching sort is instant.
  const comments = useMemo(
    () => buildCommentTree(rows, sort, post?.acceptedCommentId),
    [rows, sort, post?.acceptedCommentId],
  )

  const patchScore = useCallback(
    (kind: 'post' | 'comment', id: string, delta: number) => {
      if (!delta) return
      if (kind === 'post') {
        setPost((p) => (p && p.id === id ? { ...p, score: p.score + delta } : p))
      } else {
        setRows((list) => list.map((c) => (c.id === id ? { ...c, score: c.score + delta } : c)))
      }
    },
    [],
  )

  return { post, comments, loading, missing, error, patchScore, refresh: () => load(false) }
}

/**
 * Vote state for the whole page. Updates optimistically and rolls back if the
 * write fails, so a click always feels instant. Returns the score delta the
 * caller should apply to the row it just voted on.
 */
export function useVotes() {
  const [votes, setVotes] = useState<VoteMap>({})
  // Mirrors `votes` so `cast` can read the current value without listing it as a
  // dependency, otherwise every vote would rebuild every row's click handler.
  const ref = useRef<VoteMap>({})

  const apply = useCallback((next: VoteMap) => {
    ref.current = next
    setVotes(next)
  }, [])

  useEffect(() => {
    void api
      .myVotes()
      .then(apply)
      .catch(() => apply({}))
  }, [apply])

  const cast = useCallback(
    async (target: VoteTarget, value: 1 | -1): Promise<number> => {
      // VoteMap is a plain Record, so indexing it types as 1 | -1, so assert the
      // miss case back in or the `=== 0` checks below look unreachable to TS.
      const before = ref.current
      const previous: 1 | -1 | 0 = (before[target.id] as 1 | -1 | undefined) ?? 0
      const next: 1 | -1 | 0 = previous === value ? 0 : value

      const optimistic = { ...before }
      if (next === 0) delete optimistic[target.id]
      else optimistic[target.id] = next
      apply(optimistic)

      try {
        await api.vote(target, value)
      } catch {
        apply(before)
        return 0
      }
      return next - previous
    },
    [apply],
  )

  return { votes, cast }
}
