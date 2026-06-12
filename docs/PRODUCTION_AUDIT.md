# SquareBoards Production Readiness Audit

**Last updated:** June 9, 2026  
**Scope:** Final polish, payment hardening, event-driven payouts, automation

---

## Executive Summary

SquareBoards is a **fully automated sports entertainment platform** in architecture, with these production layers:

| Layer | Status |
|-------|--------|
| Purchase → Credits → Claim | ✅ Hardened (ledger, validation, refunds) |
| Auto board opening | ✅ On claim + cron (every 15 min) |
| Winner detection | ✅ Server cron (every 5 min) |
| Payout jobs queue | ✅ Event-driven jobs + worker cron |
| Stripe Connect transfers | ❌ Not yet enabled |
| Notification center | ✅ Page + bell + sidebar badge |

**Run migrations:** `014_payment_hardening.sql`, `015_payout_jobs.sql`

**Enable crons:** `vercel.json` schedules marketplace-sync, winner-sync, payout-worker

**Enable payouts:** Set `STRIPE_CONNECT_ENABLED=true` when Connect is configured

---

## HIGH PRIORITY ISSUES

| Issue | Status | Action |
|-------|--------|--------|
| Stripe Connect not implemented | **Open** | Implement transfers; set env flag |
| Migration 014 + 015 not deployed | **Action** | Run in Supabase before deploy |
| Checkout credit oversell race | **Mitigated** | Fulfillment blocks; add reservation (future) |
| Payout jobs fail without Connect | **Expected** | Jobs retry 5x then mark failed with audit trail |
| Claim race (partial) | **Mitigated** | Conditional `claimed=false` update |

---

## MEDIUM PRIORITY ISSUES

| Issue | Notes |
|-------|-------|
| Notification read state is localStorage | Cross-device sync needs DB table |
| Prize pool from credits not cash | Documented; aligns with current model |
| Unclaimed winning squares | Can win as "Unclaimed" |
| API rate limiting | Not implemented on public endpoints |
| Board fill = 100 claimed squares | Credits can sell out before all squares claimed |

---

## LOW PRIORITY ISSUES

- Header layout variations across immersive routes
- Favorites page stub
- Push notifications not implemented
- Purchase history nav label vs win history page

---

## Event-Driven Payout Flow (Implemented)

```
Winner sync cron
  → Calculate winner + payout amount
  → Upsert winners table
  → Enqueue payout_jobs (idempotent key: pool_id + quarter)

Payout worker cron
  → Pick queued/failed jobs (respecting next_retry_at)
  → Attempt Stripe Connect transfer (when enabled)
  → On success: mark job completed, winner payout_status = paid
  → On failure: retry with backoff, max 5 attempts, permanent audit trail
```

This survives server restarts, webhook retries, and temporary Stripe outages.

---

## Game Completion Automation (Implemented)

| Step | Mechanism |
|------|-----------|
| Verify scores | ESPN via winner-sync cron |
| Calculate winners | `detectWinnersToSync` |
| Create payout jobs | `enqueuePayoutJob` |
| Process payouts | payout-worker cron |
| Notify winners | Computed notifications API |
| Update Winners Center | Live polling APIs |
| Archive board | Pool status → `completed` on FINAL |
| Open next board | `maybeAdvanceBoardAfterClaim` + board engine cron |

---

## Deployment Checklist

- [ ] Run migrations 014 and 015
- [ ] Verify Vercel crons active (Pro plan for */5 schedules)
- [ ] Add `charge.refunded` to Stripe webhook
- [ ] Configure `CRON_SECRET`
- [ ] Implement Stripe Connect + `STRIPE_CONNECT_ENABLED=true`
- [ ] Smoke test full player journey

---

## Player Journey Target

Browse Games → Choose Game → Buy Squares → Watch Live → Win Automatically → Receive Payout → Play Again

**Current gap:** Last payout step requires Stripe Connect to move real money. Everything else is automated.
