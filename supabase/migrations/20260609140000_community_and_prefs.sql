-- Bookola — community features + reader preferences
-- Adds reading clubs, weekly challenges, and a per-user daily reading goal.
-- Grants + RLS for the new tables live at the bottom of this file (mirrors the
-- pattern in 20260609120100_security.sql).

-- ---------------------------------------------------------------------------
-- profiles — add the daily reading goal surfaced in Settings
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists daily_goal_minutes integer not null default 30
    check (daily_goal_minutes > 0 and daily_goal_minutes <= 600);

-- ---------------------------------------------------------------------------
-- clubs — reading clubs. member_count is a denormalised display baseline;
-- real membership is tracked in club_members. created_by is nullable so the
-- seed can ship starter clubs that aren't owned by any user.
-- ---------------------------------------------------------------------------
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  emoji text not null default '📚',
  member_count integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.clubs is 'Reading clubs. Readable by all; created by signed-in users.';

-- ---------------------------------------------------------------------------
-- club_members — which users belong to which club
-- ---------------------------------------------------------------------------
create table public.club_members (
  club_id uuid not null references public.clubs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (club_id, user_id)
);

comment on table public.club_members is 'Club membership join table.';

create index club_members_user_idx on public.club_members (user_id);

-- ---------------------------------------------------------------------------
-- challenges — time-boxed reading challenges (catalog-style, service managed)
-- ---------------------------------------------------------------------------
create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  emoji text not null default '🏆',
  target_value integer not null check (target_value > 0),
  target_unit text not null default 'pages'
    check (target_unit in ('pages', 'books', 'hours', 'days')),
  participant_count integer not null default 0,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

comment on table public.challenges is 'Reading challenges. Read-only catalog for clients.';

create index challenges_ends_at_idx on public.challenges (ends_at);

-- ---------------------------------------------------------------------------
-- user_challenges — a user's progress in a challenge they joined
-- ---------------------------------------------------------------------------
create table public.user_challenges (
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  progress integer not null default 0 check (progress >= 0),
  completed boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (user_id, challenge_id)
);

comment on table public.user_challenges is 'Per-user challenge participation and progress.';

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select on public.clubs      to anon, authenticated;
grant select on public.challenges to anon, authenticated;
grant insert  on public.clubs      to authenticated;          -- create a club
grant select, insert, delete on public.club_members    to authenticated;
grant select, insert, update, delete on public.user_challenges to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.clubs           enable row level security;
alter table public.club_members    enable row level security;
alter table public.challenges      enable row level security;
alter table public.user_challenges enable row level security;

-- clubs — readable by everyone; a signed-in user may create one as themselves.
create policy "Clubs are readable by everyone"
  on public.clubs for select
  to anon, authenticated
  using (true);

create policy "Users can create clubs they own"
  on public.clubs for insert
  to authenticated
  with check (created_by = (select auth.uid()));

-- club_members — membership is visible to all authenticated users (to show
-- counts); a user may only add/remove their own membership.
create policy "Club members are readable by authenticated users"
  on public.club_members for select
  to authenticated
  using (true);

create policy "Users can join clubs as themselves"
  on public.club_members for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can leave their own clubs"
  on public.club_members for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- challenges — read-only catalog.
create policy "Challenges are readable by everyone"
  on public.challenges for select
  to anon, authenticated
  using (true);

-- user_challenges — strictly owner-scoped.
create policy "Users manage their own challenge progress"
  on public.user_challenges for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
