-- ============================================================
-- 002_bug_reports.sql
-- Tester-submitted bug reports (with media) + report attachments.
--
-- Flow: testers file bug reports for the app they're testing (screenshots,
-- photos, videos). Admin reviews them per cycle, then composes the final
-- deliverable report (summary + curated media) and sends it to the buyer.
--
-- Run STEP 1 and STEP 2 together. Safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- STEP 1 · bug_reports
-- ------------------------------------------------------------
create table if not exists bug_reports (
  id                 uuid primary key default gen_random_uuid(),
  test_cycle_id      uuid not null references test_cycles(id) on delete cascade,
  tester_account_id  uuid references tester_accounts(id) on delete set null,
  title              text not null,
  description        text,
  severity           text not null default 'medium',   -- low | medium | high
  -- media: jsonb array of { url, type, name }  (type: 'image' | 'video')
  media              jsonb not null default '[]'::jsonb,
  created_at         timestamptz not null default now()
);

create index if not exists bug_reports_cycle_idx  on bug_reports(test_cycle_id);
create index if not exists bug_reports_tester_idx on bug_reports(tester_account_id);

-- ------------------------------------------------------------
-- STEP 2 · reports: carry the curated deliverable + attachments
-- ------------------------------------------------------------
alter table reports add column if not exists title       text;
alter table reports add column if not exists attachments jsonb not null default '[]'::jsonb;  -- [{url,type,name}]
alter table reports add column if not exists sent_at     timestamptz;

-- ------------------------------------------------------------
-- STEP 3 · Storage bucket for media (public read, writes via service role)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Public can read media (so report images/videos render for the buyer).
drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read"
  on storage.objects for select
  using (bucket_id = 'media');
-- Uploads/deletes happen through the service-role backend, which bypasses RLS,
-- so no client write policy is needed.

-- ------------------------------------------------------------
-- STEP 4 · RLS for bug_reports
-- (writes go through the service-role backend; only reads need policies)
-- ------------------------------------------------------------
alter table bug_reports enable row level security;

-- Admin sees everything; a tester sees their own bug reports.
drop policy if exists "bug_reports_select" on bug_reports;
create policy "bug_reports_select" on bug_reports for select using (
  is_admin() or exists (
    select 1 from tester_accounts ta
    where ta.id = bug_reports.tester_account_id and ta.user_id = auth.uid()
  )
);
