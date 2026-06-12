# Stripe Connect Sample (Accounts v2)

Self-contained demo at **`/connect-sample`** showing onboarding, products, storefront, direct charges, and subscriptions.

## Setup

1. **Upgrade Stripe SDK** (required for Accounts v2 + `parseThinEvent`):

   ```bash
   npm install stripe@latest
   ```

2. **Environment variables** (add to `.env.local`):

   ```env
   # Required — sk_test_*** or sk_live_***
   STRIPE_SECRET_KEY=sk_test_...

   # Standard webhooks (subscriptions + checkout)
   STRIPE_WEBHOOK_SECRET=whsec_...

   # Thin webhooks (V2 account requirement updates)
   STRIPE_CONNECT_SAMPLE_THIN_WEBHOOK_SECRET=whsec_...

   # Platform subscription price (price_***)
   STRIPE_CONNECT_SAMPLE_SUBSCRIPTION_PRICE_ID=price_...

   # Optional — application fee in cents on direct charges (default 123)
   STRIPE_CONNECT_SAMPLE_APP_FEE_CENTS=123
   ```

3. **Run migration** `019_connect_sample_accounts.sql` in Supabase (stores demo user → account mapping):

   ```bash
   npm run supabase:migrate:connect-sample
   ```

   Paste into the SQL Editor and click **Run**.

4. **Enable Accounts v2** (required — the sample will not work without this):

   - Open [Stripe Connect settings (Test mode)](https://dashboard.stripe.com/test/settings/connect)
   - Enable **Accounts v2**
   - Docs: https://docs.stripe.com/accounts-v2/use-accounts-as-customers

5. **Verify setup**:

   ```bash
   npm run connect-sample:verify
   ```

## Routes

| Path | Purpose |
|------|---------|
| `/connect-sample` | Merchant dashboard |
| `/connect-sample/storefront/[accountId]` | Customer storefront |
| `/api/connect-sample/webhooks/thin` | Thin V2 account events |
| `/api/connect-sample/webhooks/subscriptions` | Subscription lifecycle |

## Stripe CLI — thin events

```bash
stripe listen --thin-events 'v2.core.account[requirements].updated,v2.core.account[configuration.merchant].capability_status_updated,v2.core.account[configuration.customer].capability_status_updated' --forward-thin-to http://localhost:3000/api/connect-sample/webhooks/thin
```

## Code layout

- `lib/stripe/connectSample/client.ts` — **`getStripeClient()`** for all requests
- `lib/stripe/connectSample/v2Accounts.ts` — V2 account + account link APIs
- `lib/stripe/connectSample/products.ts` — Products with `stripeAccount` header
- `lib/stripe/connectSample/checkout.ts` — Direct charges + subscriptions
- `lib/stripe/connectSample/webhooks/` — Thin + subscription handlers
