# PaymentEngine™ — Core Platform Engine

**Status:** Active Core Platform Engine (#005)  
**Parent:** [Project Legacy (#001)](../PROJECT_LEGACY.md) · [Platform Engineering Standard](./PLATFORM_ENGINEERING_STANDARD.md)

---

## Executive Vision

**PaymentEngine™** decouples SquareBoards from any single payment merchant. After Stripe account closure for gambling/fantasy sports restrictions, the platform needs provider-agnostic financial architecture urgently — without breaking existing flows or payout calculations.

**SquareWallet™** is the platform-owned wallet experience layer. **Transaction Center** is the centralized audit trail.

---

## Architecture

```
SquareBoards Platform
    ↓
SquareWallet™ (player wallet UX + balance types)
    ↓
PaymentEngine™ (orchestration — no merchant logic)
    ↓
Payment Provider Adapter (StripeAdapter, future stubs)
    ↓
Merchant Provider (Stripe, gaming-friendly processor, ACH, …)
```

### Module layout

| Path | Role |
|------|------|
| `lib/platform/engines/payment/PaymentEngine.ts` | Main singleton — deposits, payouts, webhooks |
| `lib/platform/engines/payment/orchestrator.ts` | Transaction recording + provider routing |
| `lib/platform/engines/payment/registry.ts` | Adapter registry by `PAYMENT_PROVIDER` |
| `lib/platform/engines/payment/adapters/stripe/` | StripeAdapter — all Stripe SDK calls |
| `lib/platform/engines/payment/adapters/stubs/` | Future provider placeholders |
| `lib/platform/engines/payment/SquareWallet.ts` | Platform wallet summary + history |
| `lib/platform/engines/payment/TransactionCenter.ts` | Centralized transaction audit |
| `lib/platform/engines/payment/webhookService.ts` | Webhook delegation |

`lib/stripe/` re-exports adapter internals for backward compatibility only — **application code must import from PaymentEngine**.

---

## PaymentProvider Interface

Adapters implement transport only — **no contest business logic**:

- `createCustomer`, `deposit`, `withdraw`, `authorize`, `capture`, `refund`
- `createPayout`, `verifyIdentity`, `verifyBank`
- `savePaymentMethod`, `deletePaymentMethod`
- `processWebhook`, `getTransaction`, `cancelTransaction`

Standardized `PaymentProviderResult` responses with `PaymentError` user messages.

---

## Configuration

```env
PAYMENT_PROVIDER=stripe   # stripe | future_gaming | future_fantasy_sports | future_ach
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_CONNECT_ENABLED=false
STRIPE_CONNECT_V2_PAYOUTS=false
```

Swap providers: implement adapter + set `PAYMENT_PROVIDER`.

---

## Integration hooks

```typescript
import {
  PaymentEngine,
  startDepositCheckout,
  chargeFastCheckout,
  sendPrizePayout,
  getSquareWallet,
} from "@/lib/platform/engines/payment";
```

- **Contest entry checkout** → `PaymentEngine.deposit()`
- **Fast checkout** → `PaymentEngine.fastCheckout()`
- **Winner payouts** → `PaymentEngine.createPayout()` (PodiumEngine / payout jobs)
- **Webhooks** → `PaymentEngine.processWebhook()`
- **Wallet UI** → `getSquareWallet()`

---

## Transaction Center

Table: `payment_transactions` (migration `052_payment_transactions.sql`)

Tracks: transaction id, player, contest/pool, provider, wallet type, payment method (last4 only), amount, fees, status, audit log, errors.

---

## Rules

1. **No direct Stripe imports** in `app/` or business `lib/` — grep must be clean outside `adapters/stripe/` and `connect-sample/`
2. **Do not alter** reward/payout calculations — PaymentEngine routes only
3. **Never store raw payment info** — last4 + brand only
4. **Stripe remains** as default adapter — not removed
5. Connect-sample demo routes are exempt (Stripe Accounts v2 sandbox)

---

## Future providers

Stub adapters throw `provider_not_implemented`. To add a provider:

1. Create `adapters/<provider>/<Provider>Adapter.ts` implementing `PaymentProvider`
2. Register in `registry.ts`
3. Set `PAYMENT_PROVIDER=<id>`
4. Implement gaming-friendly merchant onboarding for production

---

## Stripe account closure — operator notes

SquareBoards' Stripe account was closed for gambling/fantasy sports policy. To go live:

1. Onboard a **gaming/fantasy-sports-friendly** payment processor (e.g. dedicated fantasy sports merchant, ACH sweepstakes provider)
2. Implement their adapter following `StripeAdapter` pattern
3. Set `PAYMENT_PROVIDER` to the new adapter
4. Re-test Connect-equivalent payout onboarding for winners
5. Run migration `052_payment_transactions.sql` on Supabase

Until a live merchant is configured, test mode (`sk_test_`) works for development only.
