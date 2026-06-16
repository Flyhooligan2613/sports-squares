# Command Center™ — Platform Build Specification #007

**Status:** Active Core Platform Engine (#007)  
**Parent:** [Project Legacy (#001)](../PROJECT_LEGACY.md) · [Platform Engineering Standard](./PLATFORM_ENGINEERING_STANDARD.md)

---

## Executive Vision

**Command Center™** is SquareBoards' internal operations hub — a single orchestration layer for admins, finance, compliance, support, and engineering. It reads from existing platform engines without duplicating business logic. **Never player-facing.**

---

## Architecture

```
Admin UI (/admin/command-center)
    ↓
API Routes (/api/admin/command-center/*)
    ↓
CommandCenterEngine™ (orchestrator)
    ↓
Adapters & Services (read-only)
    ├── statsAdapter      → pools, pickem, player_auth_profiles, payment_transactions
    ├── contestAdapter    → contest operations summary
    ├── paymentAdapter    → PaymentEngine Transaction Center
    ├── ActivityFeedService → platform_audit_log + payment_transactions + support_threads
    ├── AuditLogService   → platform_audit_log (reuse)
    ├── AlertService      → command_center_alerts
    ├── SearchService     → cross-entity search
    └── HealthService     → Supabase + PaymentEngine + webhooks
```

### Module layout

| Path | Role |
|------|------|
| `lib/platform/engines/commandCenter/CommandCenterEngine.ts` | Main orchestrator |
| `lib/platform/engines/commandCenter/adapters/` | Read-only data adapters |
| `lib/platform/engines/commandCenter/services/` | Activity, alerts, search, health, audit |
| `lib/platform/engines/commandCenter/config.ts` | Nav sections + role gates |
| `app/admin/command-center/` | Internal admin UI |
| `app/api/admin/command-center/` | Authenticated API routes |

---

## Data sources (no duplication)

| Metric | Source |
|--------|--------|
| Audit logs | `platform_audit_log` (migration 023) |
| Payments | `payment_transactions` via PaymentEngine Transaction Center (052) |
| Activity feed | Aggregates audit + payments + support |
| Champions | `podium_finishes` placement=1 (051) |
| Competitors online | `player_auth_profiles.last_active_at` |
| Alerts | `command_center_alerts` (053) |

---

## Role-based access

Default role: `operations` (full nav). Optional per-email map:

```env
COMMAND_CENTER_ROLE_MAP={"finance@example.com":"finance","support@example.com":"support"}
```

Roles: `support`, `finance`, `compliance`, `marketing`, `operations`, `executive`, `engineering`

---

## API routes

| Route | Section |
|-------|---------|
| `GET /api/admin/command-center/stats` | Dashboard KPIs |
| `GET /api/admin/command-center/activity` | Live activity feed |
| `GET /api/admin/command-center/payments` | Payment Center |
| `GET /api/admin/command-center/contests` | Contest Operations |
| `GET /api/admin/command-center/health` | System Health |
| `GET /api/admin/command-center/audit` | Audit logs |
| `GET /api/admin/command-center/search?q=` | Global search |
| `GET/PATCH /api/admin/command-center/alerts` | Alert Center |
| `GET /api/admin/command-center/executive` | Executive dashboard |

All routes require `getAuthorizedAdminUser()` + section role gate.

---

## Database

**Migration 053** — `command_center_alerts` only.

Reused tables: `platform_audit_log`, `payment_transactions`, `support_threads`.

No separate `activity_events` table — feed is aggregated at query time.

---

## Deferred / gaps

- **Compliance Center** — Stripe Identity queue, suspension dashboard
- **Community Monitor** — CommunityCore / Huddle aggregation
- **Analytics Center** — AnalyticsEngine time-series (basic bar chart uses dashboard stats)
- **Support Center** — SLA metrics (links to legacy `/admin/support`)
- **SSE** — Activity feed uses polling (30s); SSE optional future upgrade
- **Fraud signals** — Dedicated fraud engine not yet wired

---

## Integration

```typescript
import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";

const stats = await CommandCenterEngine.getDashboardStats();
const feed = await CommandCenterEngine.getActivityFeed({ limit: 50 });
```

---

## Non-goals

- Player-facing exposure
- Duplicating PaymentEngine / ContestEngine business logic
- Redesigning legacy admin pages (extended via nav link)
