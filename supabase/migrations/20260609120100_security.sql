-- Bookola — grants + Row Level Security
-- As of 2026-05-30 new public tables are NOT auto-exposed to the Data API roles,
-- so each table needs explicit GRANTs in addition to RLS policies.

-- ---------------------------------------------------------------------------
-- Grants — what the API roles may do at the SQL level (RLS narrows this further)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

-- Catalog: readable (including by signed-out users browsing the app).
grant select on public.books to anon, authenticated;

-- User-owned data: full CRUD for signed-in users (RLS scopes rows to the owner).
grant select, insert, update, delete on public.profiles      to authenticated;
grant select, insert, update, delete on public.library_items  to authenticated;
grant select, insert, update, delete on public.reviews        to authenticated;
grant select, insert, update, delete on public.review_likes   to authenticated;
grant select, insert, update, delete on public.highlights     to authenticated;
grant select, insert, update, delete on public.bookmarks      to authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS on every table (default-deny until a policy matches)
-- ---------------------------------------------------------------------------
alter table public.profiles       enable row level security;
alter table public.books          enable row level security;
alter table public.library_items  enable row level security;
alter table public.reviews        enable row level security;
alter table public.review_likes   enable row level security;
alter table public.highlights     enable row level security;
alter table public.bookmarks      enable row level security;

-- ---------------------------------------------------------------------------
-- profiles — anyone signed in can read (to show reviewer names/avatars);
-- users may only create/update their own row.
-- ---------------------------------------------------------------------------
create policy "Profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- books — read-only catalog. No write policies ⇒ only the service role
-- (which bypasses RLS) can insert/update/delete.
-- ---------------------------------------------------------------------------
create policy "Books are readable by everyone"
  on public.books for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- library_items — strictly owner-scoped
-- ---------------------------------------------------------------------------
create policy "Users manage their own library"
  on public.library_items for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- reviews — readable by all authenticated; writable only by the author
-- ---------------------------------------------------------------------------
create policy "Reviews are readable by authenticated users"
  on public.reviews for select
  to authenticated
  using (true);

create policy "Users can write their own reviews"
  on public.reviews for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own reviews"
  on public.reviews for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete their own reviews"
  on public.reviews for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- review_likes — readable by all authenticated; a user toggles only their own
-- ---------------------------------------------------------------------------
create policy "Review likes are readable by authenticated users"
  on public.review_likes for select
  to authenticated
  using (true);

create policy "Users can like as themselves"
  on public.review_likes for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can remove their own likes"
  on public.review_likes for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- highlights — strictly owner-scoped
-- ---------------------------------------------------------------------------
create policy "Users manage their own highlights"
  on public.highlights for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- bookmarks — strictly owner-scoped
-- ---------------------------------------------------------------------------
create policy "Users manage their own bookmarks"
  on public.bookmarks for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
