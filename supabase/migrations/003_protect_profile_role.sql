-- ============================================================
-- 003_protect_profile_role.sql
-- Fixes a privilege-escalation hole: "profiles_update" (schema.v2.sql)
-- only checks `auth.uid() = id` on UPDATE, with no WITH CHECK. Since
-- Postgres reuses the USING clause as the check when WITH CHECK is
-- omitted, and `id` never changes on an update, ANY signed-in user
-- could call the Supabase REST API directly (own anon-key session,
-- no app code needed) and set their own role/is_tester/credits —
-- e.g. `update profiles set role = 'admin' where id = auth.uid()`.
--
-- RLS's WITH CHECK can't compare NEW against OLD, so we lock the
-- privileged columns down with a BEFORE UPDATE trigger instead. The
-- admin backend (createAdminClient / SUPABASE_SECRET_KEY) connects
-- with the service_role JWT claim, so it's exempted and can still
-- manage these columns (see app/api/admin/testers/route.ts,
-- app/api/admin/cycles/[id]/route.ts).
--
-- Safe to re-run.
-- ============================================================

create or replace function protect_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Cannot change role directly';
  end if;
  if new.is_tester is distinct from old.is_tester then
    raise exception 'Cannot change is_tester directly';
  end if;
  if new.credits is distinct from old.credits then
    raise exception 'Cannot change credits directly';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_privileged on profiles;
create trigger profiles_protect_privileged
  before update on profiles
  for each row execute function protect_profile_privileged_columns();
