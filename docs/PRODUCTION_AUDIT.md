# SquareBoards Production Readiness Audit

**Date:** June 9, 2026  
**Scope:** Final polish pass, payment/payout hardening, automation, security, performance

---

## Executive Summary

SquareBoards has a working purchase → credit → claim → winner display pipeline. This pass hardened payment idempotency, validation, refunds, and server-side winner sync, built a global notification center, and refined UI polish without redesigning the product.

**Critical gap remaining:** Real money disbursement to winners (Stripe Connect transfers) is not implemented. `payout_status = paid` is currently an admin/database flag, not an automated bank transfer.

**Required migration:** Run `supabase/migrations/014_payment_hardening.sql` in production.

**Required cron:** Schedule `GET/POST /api/cron/winner-sync` every 1–2 minutes during game windows.

---

## HIGH PRIORITY ISSUES

| Issue | Status | Notes |
|-------|--------|-------|
| No Stripe Connect / real payout transfers | Open | No `stripe_transfer_id` audit trail |
| Credit overselling race at checkout | Mitigated | Fulfillment validates capacity; checkout has no reservation |
| Repeat-purchase webhook double-credit | Fixed | Purchases ledger; session ID not overwritten on player row |
| No refund handling | Fixed | `charge.refunded` reverses credits |
| Client-only winner detection | Mitigated | `/api/cron/winner-sync` added |
| Webhook idempotency gaps | Fixed | `stripe_webhook_events` + `purchases` ledger |
| Payment amount not validated | Fixed | Fulfillment rejects amount mismatch |
| Square claim race condition | Open | `claims.ts` lacks transactional lock |
| Migration 014 required | Action needed | Deploy payment code after migration |

---

## MEDIUM PRIORITY ISSUES

| Issue | Notes |
|-------|-------|
| Prize pool from credits not cash | Distorted by manual credits / partial refunds |
| Notification read state localStorage only | No cross-device sync yet |
| Unclaimed square can win | Winner engine allows "Unclaimed" |
| No API rate limiting | Live experience endpoints open |
| Email not unique per pool | Duplicate email rows possible |
| Favorites page stub | Linked in nav, not built |

---

## LOW PRIORITY ISSUES

- Silent DB errors in `winnerStorage.ts`
- Header inconsistency (LIVE TV vs AppMenuBar)
- Duplicate marketplace card markup
- Purchase history nav label mismatch
- No push notifications

---

## Deployment Checklist

- [ ] Run migration `014_payment_hardening.sql`
- [ ] Configure winner-sync cron
- [ ] Add `charge.refunded` to Stripe webhook events
- [ ] Plan Stripe Connect before advertising automatic bank payouts
- [ ] Smoke test: purchase → fulfill → claim → winner sync → notifications
