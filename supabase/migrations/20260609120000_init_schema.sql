-- Bookola — initial schema
-- Tables, indexes, and triggers for the reading/audiobook app.
-- Security (RLS + grants) lives in the companion 20260609120100_security.sql migration.

-- ---------------------------------------------------------------------------
-- profiles — 1:1 with auth.users, holds app-level user data
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  favorite_genres text[] not null default '{}',
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'premium')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'App-level profile data, one row per auth user.';

-- ---------------------------------------------------------------------------
-- books — the catalog (read-only to clients; managed via service role)
-- Text id matches the app''s existing slug ids (e.g. ''atomic-habits'').
-- ---------------------------------------------------------------------------
create table public.books (
  id text primary key,
  title text not null,
  author text not null,
  category text not null,
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  description text,
  cover_url text,
  accent text,
  duration text,
  pages integer check (pages is null or pages > 0),
  language text not null default 'English',
  published_year integer,
  has_audio boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.books is 'Book catalog. Read-only for clients; writes go through the service role.';

create index books_category_idx on public.books (category);

-- ---------------------------------------------------------------------------
-- library_items — a user''s personal library + per-book reading state
-- ---------------------------------------------------------------------------
create table public.library_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  book_id text not null references public.books (id) on delete cascade,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  is_favorite boolean not null default false,
  is_downloaded boolean not null default false,
  last_read_at timestamptz,
  added_at timestamptz not null default now(),
  unique (user_id, book_id)
);

comment on table public.library_items is 'Per-user library entries with reading progress and flags.';

create index library_items_user_idx on public.library_items (user_id);

-- ---------------------------------------------------------------------------
-- reviews — one review per user per book
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  book_id text not null references public.books (id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, book_id)
);

comment on table public.reviews is 'User book reviews. Readable by all authenticated users.';

create index reviews_book_idx on public.reviews (book_id);

-- ---------------------------------------------------------------------------
-- review_likes — join table for review likes
-- ---------------------------------------------------------------------------
create table public.review_likes (
  review_id uuid not null references public.reviews (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

comment on table public.review_likes is 'Tracks which users liked which reviews.';

-- ---------------------------------------------------------------------------
-- highlights — user text highlights within a book
-- ---------------------------------------------------------------------------
create table public.highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  book_id text not null references public.books (id) on delete cascade,
  body text not null,
  note text,
  color text,
  page integer,
  created_at timestamptz not null default now()
);

comment on table public.highlights is 'User highlights/annotations for a book.';

create index highlights_user_book_idx on public.highlights (user_id, book_id);

-- ---------------------------------------------------------------------------
-- bookmarks — user page bookmarks within a book
-- ---------------------------------------------------------------------------
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  book_id text not null references public.books (id) on delete cascade,
  page integer not null,
  label text,
  created_at timestamptz not null default now()
);

comment on table public.bookmarks is 'User page bookmarks for a book.';

create index bookmarks_user_book_idx on public.bookmarks (user_id, book_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Keep updated_at fresh on row updates.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up.
-- SECURITY DEFINER so it can insert into public.profiles regardless of caller.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
