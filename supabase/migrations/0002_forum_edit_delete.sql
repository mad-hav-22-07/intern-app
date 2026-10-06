-- Internship Prep Drive — letting authors edit and remove their own content.
-- Idempotent: safe to re-run. Apply after 0001_forum.sql.
--
-- `anon` still has no UPDATE or DELETE policy on either table. Everything here
-- goes through a security-definer RPC that checks `author_key` first, so the
-- ownership rule lives in one place instead of in the client.

-- --------------------------------------------------------------- columns

alter table public.forum_posts    add column if not exists edited_at timestamptz;
alter table public.forum_comments add column if not exists edited_at timestamptz;
alter table public.forum_comments add column if not exists deleted boolean not null default false;

-- ------------------------------------------------------------- edit post

create or replace function public.forum_edit_post(
  p_post  uuid,
  p_actor text,
  p_title text,
  p_body  text,
  p_topic text,
  p_flair text
) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  owner text;
  now_ts timestamptz := now();
begin
  select author_key into owner from forum_posts where id = p_post;
  if owner is null then
    raise exception 'forum_edit_post: no such post';
  end if;
  if owner is distinct from p_actor then
    raise exception 'forum_edit_post: only the author can edit this post';
  end if;

  update forum_posts
     set title = btrim(p_title),
         body  = btrim(p_body),
         topic = p_topic,
         flair = p_flair,
         edited_at = now_ts
   where id = p_post;

  return now_ts;
end $$;

grant execute on function public.forum_edit_post(uuid, text, text, text, text, text)
  to anon, authenticated;

-- ----------------------------------------------------------- delete post

create or replace function public.forum_delete_post(p_post uuid, p_actor text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  owner text;
begin
  select author_key into owner from forum_posts where id = p_post;
  if owner is null then
    return false;
  end if;
  if owner is distinct from p_actor then
    raise exception 'forum_delete_post: only the author can delete this post';
  end if;

  -- comments, votes and reports all cascade from the post row.
  delete from forum_posts where id = p_post;
  return true;
end $$;

grant execute on function public.forum_delete_post(uuid, text) to anon, authenticated;

-- ---------------------------------------------------------- edit comment

create or replace function public.forum_edit_comment(
  p_comment uuid,
  p_actor   text,
  p_body    text
) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  owner     text;
  is_gone   boolean;
  now_ts    timestamptz := now();
begin
  select author_key, deleted into owner, is_gone from forum_comments where id = p_comment;
  if owner is null then
    raise exception 'forum_edit_comment: no such comment';
  end if;
  if owner is distinct from p_actor then
    raise exception 'forum_edit_comment: only the author can edit this comment';
  end if;
  if is_gone then
    raise exception 'forum_edit_comment: this comment was removed';
  end if;

  update forum_comments set body = btrim(p_body), edited_at = now_ts where id = p_comment;
  return now_ts;
end $$;

grant execute on function public.forum_edit_comment(uuid, text, text) to anon, authenticated;

-- -------------------------------------------------------- delete comment
-- A comment with replies becomes a tombstone rather than disappearing, because
-- `parent_id` cascades and would take the whole subthread with it.

create or replace function public.forum_delete_comment(p_comment uuid, p_actor text)
returns text
language plpgsql security definer set search_path = public as $$
declare
  owner     text;
  has_kids  boolean;
begin
  select author_key into owner from forum_comments where id = p_comment;
  if owner is null then
    return 'missing';
  end if;
  if owner is distinct from p_actor then
    raise exception 'forum_delete_comment: only the author can delete this comment';
  end if;

  select exists (select 1 from forum_comments where parent_id = p_comment) into has_kids;

  if has_kids then
    update forum_comments
       set body = '[removed by the author]', deleted = true, edited_at = null
     where id = p_comment;
    return 'tombstoned';
  end if;

  -- Clear the pointer first: accepted_comment_id is ON DELETE SET NULL, but being
  -- explicit keeps the post row consistent even if that constraint is missing.
  update forum_posts set accepted_comment_id = null where accepted_comment_id = p_comment;
  delete from forum_comments where id = p_comment;
  return 'deleted';
end $$;

grant execute on function public.forum_delete_comment(uuid, text) to anon, authenticated;
