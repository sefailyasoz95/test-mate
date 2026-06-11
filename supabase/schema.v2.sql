-- ============================================================
-- TestMate v2 — Supabase / Postgres schema
-- Paid Google Play closed-testing service
-- Core idea: sell the OUTCOME (pass the 14-day requirement),
-- with transparent live tracking + free re-run guarantee.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Clean slate (safe to re-run)
-- ------------------------------------------------------------
drop table if exists reports cascade;
drop table if exists tester_assignments cascade;
drop table if exists test_cycles cascade;
drop table if exists orders cascade;
drop table if exists tester_accounts cascade;
drop table if exists apps cascade;
drop table if exists packages cascade;
drop table if exists profiles cascade;

drop type if exists user_role cascade;
drop type if exists order_status cascade;
drop type if exists cycle_status cascade;
drop type if exists tester_type cascade;
drop type if exists tester_pool_status cascade;
drop type if exists engagement_status cascade;

-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------
create type user_role          as enum ('user', 'tester', 'admin');
create type order_status        as enum ('pending', 'paid', 'failed', 'refunded');
-- cycle lifecycle: dev sets up -> we assign testers -> 14-day clock -> result
create type cycle_status        as enum ('pending_setup', 'assigning', 'active', 'completed', 'failed', 'rerun_scheduled');
create type tester_type         as enum ('owned', 'recruited', 'exchange');
create type tester_pool_status  as enum ('available', 'assigned', 'inactive');
create type engagement_status   as enum ('invited', 'opted_in', 'active', 'inactive', 'dropped');

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  google_id   text,
  role        user_role not null default 'user',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- apps  (created BEFORE orders to fix the original FK ordering bug)
-- ------------------------------------------------------------
create table apps (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  name                text not null,
  package_name        text not null,
  category            text,                 -- segmentation: never assign a tester a competing-niche app
  description         text,
  play_store_link     text,
  opt_in_link         text,                 -- closed-testing opt-in URL (required to start a cycle)
  screenshots         text[],
  created_at          timestamptz not null default now(),
  unique (user_id, package_name)
);
create index apps_user_idx on apps(user_id);

-- ------------------------------------------------------------
-- packages  (pricing lives in DATA, not code — change prices without a deploy)
-- ------------------------------------------------------------
create table packages (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null unique,            -- 'single' | 'basic12' | 'standard' | 'premium'
  name                text not null,
  tester_count        int  not null,
  duration_days       int  not null default 14,
  price_usd           numeric(10,2) not null,
  includes_report     boolean not null default false,
  includes_guarantee  boolean not null default false,  -- free re-run if it fails
  priority            boolean not null default false,
  active              boolean not null default true,
  created_at          timestamptz not null default now()
);

insert into packages (code, name, tester_count, price_usd, includes_report, includes_guarantee, priority) values
  ('single',   'Single Tester',            1,  1.00,  false, false, false),
  ('basic12',  'Basic — 12 Testers',       12, 19.00, false, false, false),
  ('standard', 'Standard — 12 + Report',   12, 29.00, true,  false, false),
  ('premium',  'Premium — Guaranteed Pass',12, 39.00, true,  true,  true);

-- ------------------------------------------------------------
-- orders  (was: purchases)
-- ------------------------------------------------------------
create table orders (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  app_id                  uuid not null references apps(id) on delete cascade,
  package_id              uuid not null references packages(id),
  amount_usd              numeric(10,2) not null,
  status                  order_status not null default 'pending',
  stripe_payment_intent   text unique,
  created_at              timestamptz not null default now()
);
create index orders_user_idx on orders(user_id);
create index orders_app_idx  on orders(app_id);

-- ------------------------------------------------------------
-- test_cycles  (the core lifecycle object — one paid 14-day campaign)
-- ------------------------------------------------------------
create table test_cycles (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references orders(id) on delete cascade,
  app_id           uuid not null references apps(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  status           cycle_status not null default 'pending_setup',
  tester_target    int  not null default 12,
  start_date       date,                                  -- set when status -> active
  end_date         date,                                  -- start_date + duration_days
  is_rerun         boolean not null default false,
  parent_cycle_id  uuid references test_cycles(id),       -- free re-run linkage (guarantee)
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index test_cycles_user_idx   on test_cycles(user_id);
create index test_cycles_status_idx on test_cycles(status);

-- ------------------------------------------------------------
-- tester_accounts  (managed supply pool: your devices + recruited + exchange)
-- ------------------------------------------------------------
create table tester_accounts (
  id                uuid primary key default gen_random_uuid(),
  email             text not null unique,
  display_name      text,
  google_id         text,
  type              tester_type not null default 'owned',
  device_model      text,
  android_version   text,
  status            tester_pool_status not null default 'available',
  reliability_score int not null default 100,             -- decremented on no-shows / dropouts
  created_at        timestamptz not null default now()
);
create index tester_accounts_status_idx on tester_accounts(status);

-- ------------------------------------------------------------
-- tester_assignments  (per-tester engagement = live status + report + guarantee logic)
-- ------------------------------------------------------------
create table tester_assignments (
  id                uuid primary key default gen_random_uuid(),
  test_cycle_id     uuid not null references test_cycles(id) on delete cascade,
  tester_account_id uuid not null references tester_accounts(id),
  engagement_status engagement_status not null default 'invited',
  opted_in_at       timestamptz,
  last_active_at    timestamptz,
  days_active       int not null default 0,
  created_at        timestamptz not null default now(),
  unique (test_cycle_id, tester_account_id)
);
create index ta_cycle_idx  on tester_assignments(test_cycle_id);
create index ta_tester_idx on tester_assignments(tester_account_id);

-- ------------------------------------------------------------
-- reports  (premium deliverable)
-- ------------------------------------------------------------
create table reports (
  id                   uuid primary key default gen_random_uuid(),
  test_cycle_id        uuid not null unique references test_cycles(id) on delete cascade,
  summary              text,
  performance          jsonb,    -- load time, crash rate, device/OS matrix
  production_checklist jsonb,    -- Play Console production-questionnaire helper
  generated_at         timestamptz not null default now()
);

-- ============================================================
-- Functions & triggers
-- ============================================================

-- Admin check as SECURITY DEFINER → avoids the RLS recursion in the old schema
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Auto-create a profile on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, google_id)
  values (new.id, new.email, new.raw_user_meta_data->>'sub')
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- keep updated_at fresh
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_touch    before update on profiles    for each row execute function touch_updated_at();
create trigger test_cycles_touch before update on test_cycles for each row execute function touch_updated_at();

-- ============================================================
-- Row Level Security
-- (writes to cycles/assignments/reports happen via service-role
--  backend, which bypasses RLS — so only read policies are needed there)
-- ============================================================
alter table profiles           enable row level security;
alter table apps               enable row level security;
alter table packages           enable row level security;
alter table orders             enable row level security;
alter table test_cycles        enable row level security;
alter table tester_accounts    enable row level security;
alter table tester_assignments enable row level security;
alter table reports            enable row level security;

-- profiles
create policy "profiles_select" on profiles for select using (auth.uid() = id or is_admin());
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- packages: public read (pricing page)
create policy "packages_select" on packages for select using (true);

-- apps: owner full access
create policy "apps_all" on apps for all
  using (auth.uid() = user_id or is_admin())
  with check (auth.uid() = user_id);

-- orders
create policy "orders_select" on orders for select using (auth.uid() = user_id or is_admin());
create policy "orders_insert" on orders for insert with check (auth.uid() = user_id);

-- test_cycles: buyer reads own
create policy "cycles_select" on test_cycles for select using (auth.uid() = user_id or is_admin());

-- tester_accounts: internal supply, admin only
create policy "tester_pool_admin" on tester_accounts for all using (is_admin()) with check (is_admin());

-- tester_assignments: buyer sees assignments for their cycles
create policy "assignments_select" on tester_assignments for select using (
  is_admin() or exists (
    select 1 from test_cycles c where c.id = test_cycle_id and c.user_id = auth.uid()
  )
);

-- reports: buyer sees the report for their cycle
create policy "reports_select" on reports for select using (
  is_admin() or exists (
    select 1 from test_cycles c where c.id = test_cycle_id and c.user_id = auth.uid()
  )
);
