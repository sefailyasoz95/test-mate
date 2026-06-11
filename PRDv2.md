# TestMate — PRD v2

**Status:** Proposed
**Author:** Sefa (with Claude)
**Supersedes:** `PRD.md` (v1)
**Theme:** Stop selling "tester slots." Start selling the **outcome** — *pass Google Play's 12-tester / 14-day closed-testing requirement* — with **transparent live tracking** and a **free re-run guarantee**.

---

## 1. Why v2

v1 is built and has made ~10 sales, so the model is validated. But the product, as coded, sells the wrong thing and hides its only real differentiator.

Three structural problems in the current build:

1. **The value is invisible.** The buyer's only feedback is a flat status badge on the app row (`waiting_for_purchase → purchased → testers_added → testers_added_google_play → test_started`), all transitioned manually by an admin (`app/api/apps/update-status/route.ts`). There is no 14-day countdown, no per-tester progress, no proof of engagement. Yet *transparent progress* is the single thing that justifies a premium over $5 Fiverr gigs.

2. **Testers are unstructured text.** `apps.tester_accounts` is a free-text column that an admin pastes emails into (`AppDetailsModal` → `update-testers`). There is no way to track which tester opted in, who dropped out, device coverage, or engagement — which is exactly what Google evaluates and exactly what powers a report.

3. **Packaging and pricing are fragile.** Packages are derived by string-matching Stripe product names that contain `"TestMate"` (`app/api/products/route.ts`), the per-app tester cap is computed as `amount / 0.99` (`AllocateTestersModal`), and `purchases.expires_at` is set to **30 days** while the requirement is **14** (`webhooks/stripe/route.ts`). There is no guarantee, no report, no outcome tier.

v2 fixes all three: a **cycle-based state machine** with **per-tester engagement tracking**, **outcome packages** (Basic / Standard+report / Premium+guarantee), and a **live dashboard** that is the product.

### Non-goals (v2)
- The peer-to-peer **exchange** model (developers testing each other). The data model is designed to support it later (`tester_accounts.type = 'exchange'`, app `category` for segmentation), but v2 ships as a **managed paid service** with an internal tester pool. This avoids the chicken-and-egg problem and the idea-theft concern for launch.
- Subscriptions. v2 is one-off orders. Keep the `subscriptions` table dormant; revisit for agencies/serial publishers in v3.

---

## 2. Current state (as-built)

**Stack:** Next.js (App Router, React 19), Supabase (Google OAuth, SSR, RLS), Stripe Checkout, shadcn/ui + Tailwind, framer-motion, react-hook-form + zod, sonner, Firebase Analytics (`trackEvent`).

**Data model** (`supabase/schema.sql`, `lib/types/supabase.ts`):
- `profiles` (id, email, google_id, super_admin, subscription_status)
- `apps` (name, package_name, play_store_link, app_review, app_screenshots[], **status** flat enum, **tester_accounts** free-text)
- `purchases` (user_id, app_id, package_type, amount, status, expires_at)
- `tester_accounts` (email, status `available|assigned`, assigned_to, expires_at) — the internal pool
- `subscriptions` (Stripe, unused in main flow)

**Flow today:**
1. Landing (`app/page.tsx`, `components/hero.tsx`) → Google sign-in.
2. Dashboard (`app/dashboard/page.tsx`) → **Add App** (`CreateAppForm`: name, package_name, play_store_link).
3. **Allocate Testers** (`AllocateTestersModal`) → fetch Stripe products → Checkout. Caps at 12 via `amount/0.99`.
4. Stripe webhook (`webhooks/stripe/route.ts`) inserts a `purchases` row (`status: completed`, `expires_at: +30d`).
5. Admin pastes tester emails into `apps.tester_accounts` and advances `status` manually (`AppDetailsModal`, `update-testers`, `update-status`).
6. Buyer sees a status badge (`status-badge.tsx`).

---

## 3. v2 product flow

### Buyer (developer who needs testers)
1. **Sign in** with Google — unchanged.
2. **Add app** — enriched. New required fields: **opt-in link** (closed-testing URL) and **tester Google Group email** (the group added to the Play Console closed track). New optional: **category** (for future segmentation), description, screenshots.
3. **Choose an outcome package** (not a raw tester count):
   - **Basic** — 12 testers, 14 days, live tracking.
   - **Standard** — Basic + post-test analysis report.
   - **Premium** — Standard + **pass guarantee** (free re-run) + priority placement.
   - **Single tester** — $1 à-la-carte anchor.
4. **Pay** (Stripe) → creates an **Order** → spawns a **Test Cycle** in `pending_setup`.
5. **Guided setup checklist** (replaces silent admin paste): confirm closed-test track is live, add the provided tester emails / Group, paste the opt-in link → mark **Ready** → cycle moves to `active`, the **14-day clock starts**.
6. **Live cycle dashboard** (the core value): `Day N / 14`, `X / 12 testers opted-in & active`, dropout alerts (auto-replaced from pool), projected production-eligible date.
7. **Completion**: production-readiness summary + Play Console questionnaire helper; Standard/Premium get the analysis report.
8. **Guarantee**: if testers drop below target or Google rejects, Premium auto-spawns a **free re-run** cycle (`is_rerun = true`, `parent_cycle_id` set). **No cash refund** (per decision: re-run > refund).

### Admin / operator (you)
- **Pool management**: add tester accounts with `type` (owned / recruited / exchange), device model, Android version, reliability score.
- **Assignment board**: per cycle, see assignments and engagement; trigger replacements.
- **Daily engagement check-in**: mark testers active (manual in v2.0, semi-automated in v2.1).

---

## 4. UI changes (screen by screen)

### 4.1 Landing — `components/hero.tsx`
- Rewrite the hero around the **outcome and the pain**: "Pass Google Play's 12-tester, 14-day requirement — with real testers and a dashboard that shows every day of progress."
- Replace the vague 3-step "How It Works" with the concrete cycle: *Add app → We assign real testers → Watch the 14-day clock → Get production-ready*.
- Add **trust blocks** the Fiverr crowd can't show: live-tracking screenshot, "free re-run if you don't pass" badge, device/OS coverage, real-engagement (anti-rejection) positioning.
- Add a public **pricing section** (currently pricing only appears post-login inside `AllocateTestersModal`). Reuse/repair `components/PricingCards.tsx` (note: it hardcodes `/month`, which is wrong for one-off orders — fix).

### 4.2 Add App — `components/dashboard/CreateAppForm.tsx`
- Add fields: `opt_in_link` (required to start a cycle), `tester_group_email` (required), `category` (select), `description` (optional), screenshots (optional).
- Update the zod schema accordingly; `play_store_link` becomes optional (a brand-new app may not be public yet — that's the whole point).

### 4.3 Buy flow — `components/dashboard/AllocateTestersModal.tsx`
- Replace Stripe-product **name string-matching** and the hardcoded feature arrays with **package data from the DB** (`packages` table) — see §5.
- Remove the `amount / 0.99` cap logic; the cycle/package defines `tester_target`.
- Sell **packages**, not quantities. Keep "Single tester ($1)" as a small à-la-carte option with quantity, but make the 12-tester outcome tiers the hero.
- On success: create `order` → `test_cycle (pending_setup)`, then route to the new **Cycle** screen.

### 4.4 Dashboard overview — `app/dashboard/page.tsx`
- Replace "Total Purchases / Expiring Soon" cards (built on `purchases`) with **cycle-centric** widgets: *Active cycles*, *Day N/14 progress bars*, *Action needed* (cycles stuck in `pending_setup`).
- App rows link to a **Cycle detail** view, not just an app-details modal.

### 4.5 NEW — Cycle dashboard (the product)
- New route `app/dashboard/cycles/[cycleId]/page.tsx`.
- **14-day countdown** with a day-by-day strip.
- **Tester grid**: each assignment as a chip — `opted_in / active / inactive / dropped`, last-active, days-active, device/OS. Powered by `tester_assignments`.
- **Health summary**: `X/12 active`, dropouts auto-flagged, **projected eligible date**.
- **Setup checklist** when `pending_setup`: add tester emails (copyable), opt-in confirmation, "Mark ready" → starts the clock.
- **Completion panel**: production-readiness checklist + Play Console questionnaire helper; report download for Standard/Premium.

### 4.6 Status display — `components/status-badge.tsx`
- Replace the app-level flat enum with **cycle status** (`pending_setup, assigning, active, completed, failed, rerun_scheduled`) plus a separate **engagement** badge set for testers.

### 4.7 Admin — `components/admin/*`
- **Tester pool manager**: CRUD over `tester_accounts` with `type`, device, Android version, reliability.
- **Cycle operations board**: assign/replace testers, mark engagement, advance/needs-attention queue (replaces ad-hoc free-text paste + manual status flips).

---

## 5. Technical changes

### 5.1 Schema (Supabase / Postgres)
Introduce the cycle model. A revised, ready-to-run `schema.sql` is included with this PRD (separate file). Summary of changes vs current:

| Area | v1 | v2 |
|---|---|---|
| Purchase record | `purchases` | `orders` (clean status enum + `stripe_payment_intent`) |
| **Lifecycle** | `apps.status` flat string | **`test_cycles`** (status state machine, 14-day window, `is_rerun`, `parent_cycle_id`) |
| **Testers on an app** | `apps.tester_accounts` free text | **`tester_assignments`** (per-tester `engagement_status`, `opted_in_at`, `last_active_at`, `days_active`) |
| Tester pool | `available/assigned`, emails only | `+ type (owned/recruited/exchange)`, device_model, android_version, reliability_score |
| Packaging | Stripe product name match | **`packages`** table (price, tester_count, includes_report, includes_guarantee, priority) |
| Premium report | none | **`reports`** (summary, performance jsonb, production_checklist jsonb) |
| App fields | name/package/link | `+ opt_in_link, tester_group_email, category, description` |
| Window | 30 days (bug) | **14 days** from `start_date` |

Schema correctness fixes carried over:
- **FK ordering bug**: original `purchases` references `apps(id)` but `apps` is created *after* it — fails on a fresh DB. v2 creates `apps` before `orders`.
- **RLS recursion**: the original super-admin policy queries `profiles` from within a `profiles` policy. v2 uses a `security definer` `is_admin()` helper.

### 5.2 Pricing as data — `app/api/products/route.ts`, `AllocateTestersModal`
- Stop filtering Stripe products by `name.includes("TestMate")`. Define packages in the `packages` table; map each to a Stripe Price ID (`packages.stripe_price_id`, or keep Price IDs in env). This lets you run **launch pricing** (e.g., Basic at $5–10 to farm first Fiverr-style reviews) and raise later **without a deploy**.

### 5.3 Order → Cycle creation — `webhooks/stripe/route.ts`
- On `checkout.session.completed`: mark `orders.status = 'paid'`, then **create a `test_cycles` row** (`status: pending_setup`, `tester_target` from package). Stop writing `purchases.expires_at = +30d`; the 14-day window is owned by the cycle and starts on **Mark ready**, not on payment.

### 5.4 Cycle state machine — new `app/api/cycles/*`
- `POST /api/cycles/[id]/start` — `pending_setup → active`, set `start_date = today`, `end_date = +14d`, assign N testers from the pool (status → `assigned`), create `tester_assignments` (`invited`).
- `POST /api/cycles/[id]/engagement` — admin/cron updates assignment `engagement_status`, `last_active_at`, `days_active`.
- `POST /api/cycles/[id]/replace` — swap a `dropped` tester for an `available` one, decrement reliability.
- `POST /api/cycles/[id]/complete` — `active → completed` (or `failed`); on failed+guarantee, spawn re-run.

### 5.5 Scheduled jobs — Supabase `pg_cron` + Edge Functions
- **Daily clock tick**: increment `days_active` for active assignments, flag inactivity, recompute projected eligible date.
- **Dropout watcher**: assignments inactive > 48h → `inactive`/`dropped` → auto-replace if below target → notify buyer.
- **Window close**: at day 14, evaluate `≥ target active`, move to `completed`/`failed`.

### 5.6 Types & client — `lib/types/supabase.ts`, `hooks/useAuth.ts`
- Regenerate types for the new tables. Replace `App.status` and `App.tester_accounts` usages with cycle/assignment reads.
- `useAuth` reads `profiles.package_type` which **doesn't exist** on `profiles` (dead field) — remove; use `role` instead.

### 5.7 Cleanups
- `middleware.ts` leaks `x-debug-*` headers (session existence, URL) on every response — remove before launch.
- `AllocateTestersModal` swallows all errors in empty `catch {}` blocks — surface failures via `toast`.
- `app/dashboard/page.tsx` `isLoading` is checked twice (outer return + inner ternary) — dead branch.

---

## 6. State machines

**Cycle:** `pending_setup → assigning → active → completed`
with `active → failed → rerun_scheduled → (new cycle) active` for the guarantee path.

**Tester assignment (engagement):** `invited → opted_in → active → (inactive ↔ active) → dropped`.
The buyer-facing health number = count of assignments in `active` with `days_active` on track for 14.

---

## 7. Packaging & pricing (config, not code)

| Package | Testers | Window | Report | Guarantee | List price | Launch price |
|---|---|---|---|---|---|---|
| Single tester | 1 | 14d | — | — | $1 | $1 |
| Basic | 12 | 14d | — | — | $19 | $5–10 (review farming) |
| Standard | 12 | 14d | ✓ | — | $29 | $19 |
| Premium | 12 | 14d | ✓ | ✓ + priority | $39 | $29 |

Rationale: Fiverr clears $5–50 for the same outcome; reviews are the moat there. Launch low to collect 5–10 five-star reviews, then raise. Report + "free re-run if you don't pass" are the differentiators most $5 sellers don't offer.

---

## 8. Delivery phasing

- **v2.0 (schema + cycle + tracking) — the unlock.** New schema, order→cycle creation, setup checklist, live cycle dashboard, `packages`-driven pricing, admin pool + assignment board. Engagement updates manual.
- **v2.1 (automation).** `pg_cron` clock, dropout watcher + auto-replace, buyer notifications (email/Firebase).
- **v2.2 (premium report).** Report generation (performance + production checklist) for Standard/Premium.
- **v3 (later).** Exchange model (segmented by `category`), subscriptions/credits for agencies, affiliate program.

---

## 9. Risks

- **Tester-farm footprint.** A small cluster of your own devices testing many strangers' apps from one IP is what Google's engagement detection flags → rejections. Mitigation: distributed `recruited` testers + reliability scoring; position on *real* engagement, not farmed installs.
- **Google policy drift.** The 12/14 rule can change (it already moved from 20→12). Keep `tester_count`/`duration_days` in `packages`/`test_cycles` data so a rule change is a config edit, not a refactor.
- **Operational load.** Manual engagement updates don't scale; v2.1 automation is what makes the volume math ($1–3k/mo) sustainable.
- **Idea-theft (exchange only).** Deferred to v3; when enabled, segment by `category` so a tester never sees a competing-niche app.

---

## 10. Acceptance criteria (v2.0)

1. A buyer can add an app with opt-in link + Group email, pay for a package, and land on a cycle in `pending_setup`.
2. Completing the setup checklist starts a real 14-day clock and creates 12 `tester_assignments`.
3. The cycle dashboard shows live `Day N/14` and per-tester engagement.
4. A dropped tester can be replaced (manually in 2.0) and the buyer sees the change.
5. Pricing/packages are editable in the DB with no code deploy.
6. Premium failure path creates a linked free re-run cycle.
7. The FK-ordering and RLS-recursion bugs from v1 are gone; `pg_cron`-ready schema applied.
