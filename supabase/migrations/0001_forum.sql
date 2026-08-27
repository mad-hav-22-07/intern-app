-- Internship Prep Drive — forum schema
-- Apply in the Supabase SQL editor (or `supabase db push`).
-- Identity note: the app has no real auth yet, so `author_key` / `voter_key` are
-- per-browser UUIDs minted client-side. They are good enough to make voting and
-- ownership behave correctly, but they are self-asserted. Swap them for
-- `auth.uid()` when real accounts land.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- posts

create table if not exists public.forum_posts (
  id            uuid primary key default gen_random_uuid(),
  title         text        not null check (char_length(btrim(title)) between 5 and 200),
  body          text        not null check (char_length(btrim(body)) between 1 and 10000),
  topic         text        not null default 'general',
  flair         text        not null default 'Question',
  author_name   text        not null check (char_length(author_name) between 1 and 80),
  author_roll   text        not null default '—',
  author_key    text        not null,
  is_anonymous  boolean     not null default false,
  pinned        boolean     not null default false,
  score         integer     not null default 0,
  comment_count integer     not null default 0,
  report_count  integer     not null default 0,
  accepted_comment_id uuid,
  created_at    timestamptz not null default now(),
  search        tsvector generated always as (
                  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                  setweight(to_tsvector('english', coalesce(body,  '')), 'B')
                ) stored
);

create index if not exists forum_posts_created_idx on public.forum_posts (created_at desc);
create index if not exists forum_posts_topic_idx   on public.forum_posts (topic, created_at desc);
create index if not exists forum_posts_score_idx   on public.forum_posts (score desc);
create index if not exists forum_posts_search_idx  on public.forum_posts using gin (search);

-- ------------------------------------------------------------- comments

create table if not exists public.forum_comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid        not null references public.forum_posts(id)    on delete cascade,
  parent_id   uuid                 references public.forum_comments(id) on delete cascade,
  body        text        not null check (char_length(btrim(body)) between 1 and 5000),
  author_name text        not null check (char_length(author_name) between 1 and 80),
  author_roll text        not null default '—',
  author_key  text        not null,
  is_anonymous boolean    not null default false,
  score       integer     not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists forum_comments_post_idx   on public.forum_comments (post_id, created_at);
create index if not exists forum_comments_parent_idx on public.forum_comments (parent_id);

do $$ begin
  alter table public.forum_posts
    add constraint forum_posts_accepted_fk
    foreign key (accepted_comment_id) references public.forum_comments(id) on delete set null;
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------- votes

create table if not exists public.forum_votes (
  id         uuid primary key default gen_random_uuid(),
  voter_key  text        not null,
  post_id    uuid                 references public.forum_posts(id)    on delete cascade,
  comment_id uuid                 references public.forum_comments(id) on delete cascade,
  value      smallint    not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  constraint forum_votes_one_target check (num_nonnulls(post_id, comment_id) = 1)
);

create unique index if not exists forum_votes_post_uniq
  on public.forum_votes (voter_key, post_id)    where post_id    is not null;
create unique index if not exists forum_votes_comment_uniq
  on public.forum_votes (voter_key, comment_id) where comment_id is not null;

-- -------------------------------------------------------------- reports

create table if not exists public.forum_reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_key text        not null,
  post_id      uuid                 references public.forum_posts(id)    on delete cascade,
  comment_id   uuid                 references public.forum_comments(id) on delete cascade,
  reason       text        not null default 'other',
  created_at   timestamptz not null default now(),
  constraint forum_reports_one_target check (num_nonnulls(post_id, comment_id) = 1)
);

create unique index if not exists forum_reports_post_uniq
  on public.forum_reports (reporter_key, post_id)    where post_id    is not null;
create unique index if not exists forum_reports_comment_uniq
  on public.forum_reports (reporter_key, comment_id) where comment_id is not null;

-- ------------------------------------------------- denormalisation triggers

create or replace function public.forum_sync_comment_count() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update forum_posts set comment_count = comment_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update forum_posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end $$;

drop trigger if exists forum_comments_count on public.forum_comments;
create trigger forum_comments_count
  after insert or delete on public.forum_comments
  for each row execute function public.forum_sync_comment_count();

create or replace function public.forum_sync_score() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  target_post uuid    := coalesce(new.post_id, old.post_id);
  target_cmt  uuid    := coalesce(new.comment_id, old.comment_id);
  delta       integer := coalesce(new.value, 0) - coalesce(old.value, 0);
begin
  if delta = 0 then return null; end if;
  if target_post is not null then
    update forum_posts    set score = score + delta where id = target_post;
  else
    update forum_comments set score = score + delta where id = target_cmt;
  end if;
  return null;
end $$;

drop trigger if exists forum_votes_score on public.forum_votes;
create trigger forum_votes_score
  after insert or update or delete on public.forum_votes
  for each row execute function public.forum_sync_score();

create or replace function public.forum_sync_report_count() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.post_id is not null then
    update forum_posts set report_count = report_count + 1 where id = new.post_id;
  end if;
  return null;
end $$;

drop trigger if exists forum_reports_count on public.forum_reports;
create trigger forum_reports_count
  after insert on public.forum_reports
  for each row execute function public.forum_sync_report_count();

-- ------------------------------------------------------------ vote RPC
-- Anon clients cannot touch forum_votes directly (see RLS below). All vote
-- bookkeeping goes through here so the toggle semantics are enforced server-side.

create or replace function public.forum_vote(
  p_voter   text,
  p_value   smallint,
  p_post    uuid default null,
  p_comment uuid default null
) returns integer
language plpgsql security definer set search_path = public as $$
declare
  existing smallint;
  result   integer;
begin
  if num_nonnulls(p_post, p_comment) <> 1 then
    raise exception 'forum_vote: pass exactly one of p_post / p_comment';
  end if;
  if p_value not in (-1, 0, 1) then
    raise exception 'forum_vote: value must be -1, 0 or 1';
  end if;
  if coalesce(btrim(p_voter), '') = '' then
    raise exception 'forum_vote: voter key required';
  end if;

  select value into existing from forum_votes
   where voter_key = p_voter
     and post_id is not distinct from p_post
     and comment_id is not distinct from p_comment;

  if p_value = 0 or existing = p_value then
    delete from forum_votes
     where voter_key = p_voter
       and post_id is not distinct from p_post
       and comment_id is not distinct from p_comment;
  elsif existing is null then
    insert into forum_votes (voter_key, post_id, comment_id, value)
    values (p_voter, p_post, p_comment, p_value);
  else
    update forum_votes set value = p_value
     where voter_key = p_voter
       and post_id is not distinct from p_post
       and comment_id is not distinct from p_comment;
  end if;

  if p_post is not null then
    select score into result from forum_posts    where id = p_post;
  else
    select score into result from forum_comments where id = p_comment;
  end if;
  return coalesce(result, 0);
end $$;

grant execute on function public.forum_vote(text, smallint, uuid, uuid) to anon, authenticated;

-- Returns this browser's own votes so the UI can highlight them.
create or replace function public.forum_my_votes(p_voter text)
returns table (post_id uuid, comment_id uuid, value smallint)
language sql security definer set search_path = public as $$
  select post_id, comment_id, value from forum_votes where voter_key = p_voter;
$$;

grant execute on function public.forum_my_votes(text) to anon, authenticated;

-- --------------------------------------------------- accepted answer RPC
-- Anon has no UPDATE policy on forum_posts, so this is the only way to set an
-- accepted answer — and it checks ownership before it does.

create or replace function public.forum_accept_answer(
  p_post    uuid,
  p_actor   text,
  p_comment uuid default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  owner text;
begin
  select author_key into owner from forum_posts where id = p_post;
  if owner is null then
    raise exception 'forum_accept_answer: no such post';
  end if;
  if owner is distinct from p_actor then
    raise exception 'forum_accept_answer: only the post author can accept an answer';
  end if;
  if p_comment is not null and not exists (
    select 1 from forum_comments where id = p_comment and post_id = p_post
  ) then
    raise exception 'forum_accept_answer: comment does not belong to this post';
  end if;

  update forum_posts set accepted_comment_id = p_comment where id = p_post;
  return p_comment;
end $$;

grant execute on function public.forum_accept_answer(uuid, text, uuid) to anon, authenticated;

-- ------------------------------------------------------------------ RLS
-- Deliberately permissive: there is no auth yet, so the anon key is the only
-- credential. Reads and inserts are open; updates and deletes are closed, and
-- every derived number (score, counts) is written by triggers, not by clients.

alter table public.forum_posts    enable row level security;
alter table public.forum_comments enable row level security;
alter table public.forum_votes    enable row level security;
alter table public.forum_reports  enable row level security;

drop policy if exists forum_posts_read     on public.forum_posts;
drop policy if exists forum_posts_insert   on public.forum_posts;
drop policy if exists forum_comments_read  on public.forum_comments;
drop policy if exists forum_comments_insert on public.forum_comments;
drop policy if exists forum_reports_insert on public.forum_reports;

create policy forum_posts_read      on public.forum_posts    for select using (true);
create policy forum_posts_insert    on public.forum_posts    for insert with check (
  score = 0 and comment_count = 0 and report_count = 0 and pinned = false
);
create policy forum_comments_read   on public.forum_comments for select using (true);
create policy forum_comments_insert on public.forum_comments for insert with check (score = 0);
create policy forum_reports_insert  on public.forum_reports  for insert with check (true);
-- no policies on forum_votes: anon reaches it only through forum_vote()/forum_my_votes()

-- Realtime
do $$ begin
  alter publication supabase_realtime add table public.forum_posts;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.forum_comments;
exception when duplicate_object then null; end $$;
