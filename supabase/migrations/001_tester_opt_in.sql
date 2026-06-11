-- ============================================================
-- TestMate — Self-serve tester opt-in
-- Run STEP 1 on its own first (enum change), then run STEP 2.
-- All additive & idempotent; safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- STEP 1 — add the new tester type (run this block ALONE first)
-- (ALTER TYPE ... ADD VALUE cannot be used in the same txn it's
--  created in, so keep it separate from the inserts below.)
-- ------------------------------------------------------------
alter type tester_type add value if not exists 'community';


-- ------------------------------------------------------------
-- STEP 2 — columns, constraints, policies (run after STEP 1)
-- ------------------------------------------------------------

-- profiles: tester capability flag + earned reward credits
alter table profiles
  add column if not exists is_tester boolean not null default false,
  add column if not exists credits   int     not null default 0;   -- earned free Basic-12 cycles

-- tester_accounts: link to the logged-in user + onboarding/reward fields
alter table tester_accounts
  add column if not exists user_id           uuid references auth.users(id) on delete set null,
  add column if not exists country           text,
  add column if not exists apps_tested_count int not null default 0,   -- 12 → +1 profile credit
  add column if not exists terms_accepted_at timestamptz;

-- one tester profile per user (manual/owned rows keep user_id null)
create unique index if not exists tester_accounts_user_uniq
  on tester_accounts(user_id) where user_id is not null;

create index if not exists tester_accounts_user_idx on tester_accounts(user_id);

-- ------------------------------------------------------------
-- RLS: a tester may read their OWN pool row (client-side reads).
-- All writes still go through the secret-key API routes.
-- The existing admin-only policy stays; this adds a self-read path.
-- ------------------------------------------------------------
drop policy if exists "tester_self_select" on tester_accounts;
create policy "tester_self_select" on tester_accounts
  for select using (auth.uid() = user_id or is_admin());

-- A tester may read the assignments that belong to them (check-in dashboard).
drop policy if exists "assignments_tester_select" on tester_assignments;
create policy "assignments_tester_select" on tester_assignments
  for select using (
    exists (
      select 1 from tester_accounts ta
      where ta.id = tester_account_id and ta.user_id = auth.uid()
    )
  );
