/**
 * Push the example threads in src/data/forum.ts into Supabase, so a freshly
 * migrated database isn't an empty page.
 *
 * Neither tsx nor node auto-loads .env.local — pass it explicitly:
 *   npx dotenv -e .env.local -- npx tsx scripts/seed-forum.ts
 *
 * Safe to re-run: it bails out if the forum already has posts.
 */
import { createClient } from '@supabase/supabase-js'
import { seedComments, seedPosts } from '../src/data/forum'

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.')
  process.exit(1)
}

const sb = createClient(url, key, { auth: { persistSession: false } })

async function main() {
  const { count, error: countError } = await sb
    .from('forum_posts')
    .select('id', { count: 'exact', head: true })
  if (countError) throw countError

  if (count && count > 0) {
    console.log(`forum_posts already has ${count} rows — nothing to seed.`)
    return
  }

  const posts = seedPosts()
  const comments = seedComments()

  // Seed ids are 'p1'…'p10', not uuids, so let Postgres mint real ones and keep
  // a map from the seed id to it for the comments' post_id / parent_id.
  const idMap = new Map<string, string>()

  for (const p of posts) {
    const { data, error } = await sb
      .from('forum_posts')
      .insert({
        title: p.title,
        body: p.body,
        topic: p.topic,
        flair: p.flair,
        author_name: p.authorName,
        author_roll: p.authorRoll,
        author_key: p.authorKey,
        is_anonymous: p.isAnonymous,
      })
      .select('id')
      .single()
    if (error) throw error
    idMap.set(p.id, data.id as string)
  }

  // Parents before children, so parent_id always resolves.
  const ordered = [...comments].sort(
    (a, b) => Number(Boolean(a.parentId)) - Number(Boolean(b.parentId)),
  )

  for (const c of ordered) {
    const postId = idMap.get(c.postId)
    if (!postId) continue

    const { data, error } = await sb
      .from('forum_comments')
      .insert({
        post_id: postId,
        parent_id: c.parentId ? (idMap.get(c.parentId) ?? null) : null,
        body: c.body,
        author_name: c.authorName,
        author_roll: c.authorRoll,
        author_key: c.authorKey,
        is_anonymous: c.isAnonymous,
      })
      .select('id')
      .single()
    if (error) throw error
    idMap.set(c.id, data.id as string)
  }

  console.log(`Seeded ${posts.length} posts and ${comments.length} comments.`)
  console.log('Note: scores start at 0 — the seed votes are not replayed.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
