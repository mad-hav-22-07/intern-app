-- Internship Prep Drive — real accounts.
-- Idempotent: safe to re-run. Apply after 0002_forum_edit_delete.sql.
--
-- Supabase Auth already gives us: bcrypt password hashing, one account per email
-- address, email confirmation, password-reset tokens, and rate limiting. This
-- migration adds the two rules that are specific to this platform and therefore
-- have to be enforced here rather than in the client:
--
--   1. only @smail.iitm.ac.in addresses may create an account
--   2. one account per roll number
--
-- Both are triggers on the auth schema, so they hold no matter how the signup was
-- called. The matching checks in `src/lib/auth.ts` exist only to give the form
-- fast feedback; they are not the boundary.

-- ------------------------------------------------------------- profiles

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text        not null unique,
  roll_no     text        not null unique,
  full_name   text        not null default '',
  branch      text        not null default '',
  year        text        not null default '',
  cgpa        text        not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is
  'One row per account. Created automatically by the handle_new_user trigger.';

-- ------------------------------------------------- institute domain rule

create or replace function public.enforce_institute_email() returns trigger
language plpgsql security definer set search_path = public, auth as $$
begin
  if lower(new.email) not like '%@smail.iitm.ac.in' then
    raise exception 'Accounts are limited to @smail.iitm.ac.in addresses'
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

drop trigger if exists enforce_institute_email on auth.users;
create trigger enforce_institute_email
  before insert on auth.users
  for each row execute function public.enforce_institute_email();

-- --------------------------------------------- profile on signup + roll rule
-- The roll number is derived from the email local part rather than typed, so it
-- cannot be claimed by someone else. The unique constraint on profiles.roll_no
-- is what actually stops a duplicate; raising here just turns it into a readable
-- message. Because this runs inside the signup transaction, a conflict rolls the
-- whole auth.users insert back and no orphan account is left behind.

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public, auth as $$
declare
  derived_roll text := upper(split_part(new.email, '@', 1));
begin
  if exists (select 1 from public.profiles where roll_no = derived_roll) then
    raise exception 'An account already exists for roll number %', derived_roll
      using errcode = 'unique_violation';
  end if;

  insert into public.profiles (id, email, roll_no, full_name)
  values (
    new.id,
    lower(new.email),
    derived_roll,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------ RLS
-- A signed-in user can read and edit exactly their own row and nobody else's.
-- There is no insert policy: rows only ever come from the trigger above, and no
-- delete policy: removing the auth user cascades.

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Identity columns are derived, never client-supplied. Freeze them.
create or replace function public.freeze_profile_identity() returns trigger
language plpgsql as $$
begin
  new.id      := old.id;
  new.email   := old.email;
  new.roll_no := old.roll_no;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists freeze_profile_identity on public.profiles;
create trigger freeze_profile_identity
  before update on public.profiles
  for each row execute function public.freeze_profile_identity();

-- --------------------------------------------------- forum ownership
-- With accounts, a post's author_key becomes the user's uid instead of a
-- per-browser UUID. This backfills nothing (old rows keep their browser keys and
-- simply stay editable by that browser) but it means new content is tied to a
-- verified institute account.
--
-- The client sends the uid; this constraint stops it claiming someone else's.
-- `auth.uid()` is null for signed-out visitors, which is why the check allows a
-- non-uuid key through: local-only browsers still work.

create or replace function public.forum_author_matches_session() returns trigger
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is not null and new.author_key <> auth.uid()::text then
    raise exception 'author_key must match the signed-in user';
  end if;
  return new;
end $$;

drop trigger if exists forum_posts_author_check on public.forum_posts;
create trigger forum_posts_author_check
  before insert on public.forum_posts
  for each row execute function public.forum_author_matches_session();

drop trigger if exists forum_comments_author_check on public.forum_comments;
create trigger forum_comments_author_check
  before insert on public.forum_comments
  for each row execute function public.forum_author_matches_session();

-- ------------------------------------------------------------------ notes
--
-- Three settings still have to be turned on in the Supabase dashboard; SQL
-- cannot set them:
--
--   Authentication → Providers → Email
--     • "Confirm email" ON. Without it anyone can sign up as any address.
--   Authentication → Attack Protection
--     • "Leaked password protection" ON (checks HaveIBeenPwned on signup).
--     • Keep email enumeration protection ON so the signup and reset forms
--       cannot be used to discover which addresses are registered.
--   Authentication → URL Configuration
--     • Site URL and redirect allow-list set to the deployed origin, or the
--       confirmation and reset links will point at localhost.
