# Phase 3G — Admin Command Center (Mission Control)

**Project:** PROJECT BLACK LABEL  
**Scope:** Enterprise admin dashboard, activity feed, navigation shell, wired ops KPIs, player/support/wallet/security sections  
**Frozen areas:** Homepage, onboarding, wallet UI, contests, rewards, profiles, notifications — **not modified**

---

## Summary

Phase 3G elevates the existing Command Center™ into a Stripe/Shopify-style mission control: executive KPI cards with real data, live activity feed, unified navigation shell with role footer, player management, enhanced support queue, and professional Coming Soon stubs for rolling capabilities.

`/admin` redirects to `/admin/command-center` as the admin home.

---

## Admin Home Dashboard (`/admin/command-center`)

| KPI | Source | Status |
|-----|--------|--------|
| Open support tickets | `support_threads` (not resolved/closed) | **live** |
| Pending withdrawals | `payment_transactions` (`withdrawal` + `pending`) | **live** |
| Withdrawal holds | `withdrawal_review_holds` via `WithdrawalHoldService` | **live** |
| Pending KYC | `square_bank_accounts` (`kyc_status = pending`) | **live** |
| Active contests | `pools` + `pickem_contests` | **live** |
| Entries today | `payment_transactions` (`contest_entry`, today) | **live** |
| New registrations | `player_profiles` (today) | **live** |
| Platform alerts | `command_center_alerts` evaluation | **live** |
| System health | `HealthService` → healthy/degraded/critical | **live** |
| Deposits / withdrawals today | `payment_transactions` | **live** |
| Competitors online | `player_auth_profiles.last_active_at` | **live** |
| Prize pools / fill rate | `pools`, `squares` | **live** |

API: `GET /api/admin/command-center/stats` → `CommandCenterEngine.getDashboardStats()`

---

## Real-Time Activity Feed

| Event type | Source | Status |
|------------|--------|--------|
| Audit events | `platform_audit_log` | **live** |
| Deposits / withdrawals | `payment_transactions` | **live** |
| Support tickets | `support_threads` | **live** |
| Registrations | `player_profiles` | **live** |
| KYC pending | `square_bank_accounts` | **live** |

API: `GET /api/admin/command-center/activity` — 30s client poll (`ACTIVITY_FEED_POLL_MS`)

---

## Navigation / Mission Control Shell

`CommandCenterShell` — sidebar sections:

| Section | Route | Status |
|---------|-------|--------|
| Overview | `/admin/command-center` | **live** |
| Players | `/admin/command-center/players` | **live** |
| Contests | `/admin/command-center/contests` | **live** |
| Wallet | `/admin/command-center/payments` | **live** |
| Finance | `/admin/command-center/finance` | **live** |
| Verification | `/admin/command-center/compliance` | **stub** + links |
| Support | `/admin/command-center/support` | **partial** (live queue) |
| Announcements | `/admin/command-center/announcements` | **stub** → Classic Admin |
| Analytics | `/admin/command-center/analytics` | **partial** (SquarePass + charts) |
| Security | `/admin/command-center/security` | **stub** → `/admin/security` |
| System Health | `/admin/command-center/health` | **live** |
| Alerts | `/admin/command-center/alerts` | **live** |
| Audit Log | `/admin/command-center/audit` | **live** |
| Search | `/admin/command-center/search` | **live** (+ quick search in shell) |

Role footer documents: Owner, Admin, Support, Compliance, Finance, Moderator (future RBAC via `COMMAND_CENTER_ROLE_MAP`).

---

## Player Management

| Feature | Route / API | Status |
|---------|-------------|--------|
| Recent registrations | `GET /api/admin/command-center/players?recent=20` | **live** |
| Search (email + profile) | `GET /api/admin/command-center/players?q=` | **live** |
| Filter suspended / flagged | Client filter on `player_auth_profiles` | **live** |
| Profile link | `/profile/[slug]` | **live** |
| Security actions | Link to `/admin/security` | **live** |

Also available at `/admin/players` (Classic Admin nav).

---

## Support Center

| Feature | Status |
|---------|--------|
| Open ticket count | **live** — `/api/admin/support/threads` |
| Priority queue list | **live** — `SupportCenterStub` |
| Full inbox | **live** — `/admin/support` (Classic Admin) |
| SLA / agent workflow | **planned** |

---

## Wallet Management

| Feature | Route | Status |
|---------|-------|--------|
| Payment Center | `/admin/command-center/payments` | **live** |
| Pending / holds / transactions | `paymentAdapter` + `WithdrawalHoldService` | **live** |
| Legacy financial | `/admin/financial` | **live** |

---

## Security Center

| Feature | Status |
|---------|--------|
| Player lookup, suspend, force logout | **live** — `/admin/security` |
| Command Center landing | **stub** — `/admin/command-center/security` |
| Failed login aggregation | **planned** |

---

## Audit Log

`platform_audit_log` via `GET /api/admin/command-center/audit` — **live**

Classic route `/admin/audit-log` unchanged.

---

## Global Admin Search

`GET /api/admin/command-center/search` — pools, players, payments, audit, support  
Quick search in Command Center header; deep search page accepts `?q=` query param.

---

## Files Changed (Phase 3G)

### Core engine
- `lib/platform/engines/commandCenter/types.ts`
- `lib/platform/engines/commandCenter/config.ts`
- `lib/platform/engines/commandCenter/adapters/statsAdapter.ts`
- `lib/platform/engines/commandCenter/CommandCenterEngine.ts`
- `lib/platform/engines/commandCenter/services/ActivityFeedService.ts`
- `lib/platform/engines/commandCenter/services/SearchService.ts`

### UI
- `components/admin/commandCenter/CommandCenterShell.tsx`
- `components/admin/commandCenter/DashboardStatGrid.tsx`
- `components/admin/commandCenter/ActivityFeedPanel.tsx`
- `components/admin/commandCenter/SupportCenterStub.tsx`
- `components/admin/AdminPlatformPlayersClient.tsx`
- `components/admin/AdminShell.tsx`

### Routes
- `app/admin/page.tsx` (redirect → command center)
- `app/admin/players/page.tsx`
- `app/admin/command-center/players/page.tsx`
- `app/admin/command-center/announcements/page.tsx`
- `app/admin/command-center/security/page.tsx`
- `app/admin/command-center/search/page.tsx`
- `app/api/admin/command-center/players/route.ts`

### Data
- `lib/database/services/supportMessages.ts` (priority on threads)

---

## Frozen Customer Areas

No changes to: homepage, onboarding flows, wallet UI, contest center, rewards, player profiles, notification hub.

---

## Definition of Done

- [x] Executive KPI dashboard with real ops metrics
- [x] Live activity feed (registrations, payments, support, KYC)
- [x] Mission control navigation + role footer
- [x] Player management search/list
- [x] Support queue wired to threads API
- [x] Wallet / security / announcements stubs with enterprise Coming Soon panels
- [x] Global search enhanced (quick search + `?q=` deep link)
- [x] Audit log live
- [x] `npm run build` passes
