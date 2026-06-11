# Milestone 8 — Supabase Database Migration

## Overview

Sports Squares now persists pools, players, squares, and winners in Supabase. The app uses a two-phase migration strategy so existing localStorage data continues to work during rollout.

| Phase | Env value | Behavior |
|-------|-----------|----------|
| **Phase 1** (default) | `NEXT_PUBLIC_DB_READ_PHASE=1` | All writes go to Supabase. Reads use Supabase first; if data is missing, localStorage is used as fallback. |
| **Phase 2** | `NEXT_PUBLIC_DB_READ_PHASE=2` | Reads and writes use Supabase only. |

---

## 1. Run the SQL schema

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Go to **SQL Editor** → **New query**
3. Paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run**

This creates:

- `pools` — pool metadata, status, number-draw arrays
- `players` — participants and credit allocation
- `squares` — 100 squares per pool with claim state
- `winners` — quarter scoring results

Row Level Security is enabled with permissive policies (admin auth remains app-level).

---

## 2. Configure environment

Copy `.env.local.example` to `.env.local` if needed:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_DB_READ_PHASE=1
```

Restart the dev server after changing env vars.

---

## 3. Verify connection

1. Sign in as admin at `/admin/login`
2. Open **Admin → Database** (`/admin/database-status`)
3. Confirm **Supabase Connection** shows Connected
4. Click **Test Database** — you should see table counts (0 initially)

---

## 4. Phase 1 testing (hybrid mode)

1. Keep `NEXT_PUBLIC_DB_READ_PHASE=1`
2. Create a new pool at `/create` (admin only)
3. On Database Status, confirm **Pools** and **Squares** counts increased
4. Add players, claim squares, lock board, draw numbers, enter scores
5. Refresh the page — data should persist from Supabase
6. Existing localStorage demo pool still loads if not yet migrated

Local pools are auto-migrated to Supabase on first read when possible.

---

## 5. Switch to Phase 2

When all important data is in Supabase:

1. Set `NEXT_PUBLIC_DB_READ_PHASE=2` in `.env.local`
2. Restart the dev server
3. Confirm pools, players, and winners load correctly
4. Database Status should show Phase 2

---

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| Table counts fail | Run `001_initial_schema.sql` in SQL Editor |
| RLS permission denied | Re-run migration policies section |
| SSL / fetch errors in dev | Check Supabase URL and publishable key |
| Old localStorage data missing in Phase 2 | Temporarily set Phase 1, open each pool to trigger migration |

---

## File map

| Path | Purpose |
|------|---------|
| `supabase/migrations/001_initial_schema.sql` | Database schema |
| `lib/database/types.ts` | Table row TypeScript types |
| `lib/database/mappers.ts` | DB rows ↔ app `Pool` model |
| `lib/database/services/*.ts` | Supabase CRUD operations |
| `lib/poolStore.ts` | Unified store (phase logic) |
| `lib/winnerStorage.ts` | Winner history (Supabase + fallback) |
| `lib/mockData.ts` | localStorage fallback (Phase 1) |
| `app/admin/database-status/page.tsx` | Admin health dashboard |
