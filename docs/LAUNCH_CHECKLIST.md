# SquareBoards Launch Checklist

**Production URL:** https://www.squareboards.pro  
**Support:** support@squareboards.pro  
**Last updated:** June 2026

Operator checklist — complete in order before public launch. No feature work; verify infrastructure, payments, and core flows only.

---

## 1. Deploy & build

- [ ] `npm run build` passes locally (no TypeScript or build errors)
- [ ] Latest `main` deployed to Vercel Production
- [ ] Vercel deployment shows **Ready** (not failed or rolled back)
- [ ] `SITE_URL` and `NEXT_PUBLIC_APP_URL` set to `https://www.squareboards.pro`
- [ ] `NEXT_PUBLIC_DB_READ_PHASE=2` (Supabase-only reads)

---

## 2. Supabase

- [ ] All migrations applied through latest (`061_deposit_match_bonus.sql`, `062_premium_emojis.sql`, and any newer)
- [ ] Auth **Site URL:** `https://www.squareboards.pro`
- [ ] Auth **Redirect URLs** include `https://www.squareboards.pro/auth/callback`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Vercel (server-only)
- [ ] Cron secret set: `CRON_SECRET` (required for marketplace/pickem sync)

**Verify migrations (Supabase SQL Editor):**

```sql
SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 5;
```

---

## 3. Stripe & webhooks

- [ ] `STRIPE_SECRET_KEY` = `sk_live_...` in Vercel Production
- [ ] `STRIPE_WEBHOOK_SECRET` = live signing secret from Stripe Dashboard
- [ ] `STRIPE_CONNECT_ENABLED=true`
- [ ] `STRIPE_CONNECT_V2_PAYOUTS=true`
- [ ] Live webhook endpoint: `https://www.squareboards.pro/api/webhooks/stripe`
- [ ] Webhook events subscribed: `checkout.session.completed`, `charge.refunded`, `account.updated`
- [ ] Stripe Dashboard → Webhooks → **Send test event** returns **200**

---

## 4. Email & push (optional but recommended)

- [ ] `RESEND_API_KEY` + `RESEND_FROM_EMAIL` configured (magic link / password reset)
- [ ] `VAPID_*` keys set if push notifications enabled (`npm run push:generate-vapid`)
- [ ] `NEXT_PUBLIC_ADMIN_EMAILS` lists authorized staff accounts

---

## 5. Data sync

- [ ] Run marketplace sync: `npm run marketplace:sync` (or verify Vercel cron fired)
- [ ] Run pickem sync: `npm run pickem:sync`
- [ ] Home **Browse Games** shows live boards for at least one sport
- [ ] Pick'em week page shows current slate

---

## 6. Trust Center (underwriter review)

- [ ] `/trust` hub loads — 12 policies + Merchant Information accordion
- [ ] Merchant documentation accessible and current:

| Document ID | Route |
|-------------|-------|
| ALD-MER-001 | `/trust/merchant-executive-summary` |
| ALD-COR-001 | `/trust/company-overview` |
| ALD-BUS-001 | `/trust/business-model` |
| ALD-CMP-001 | `/trust/compliance-risk-management` |

- [ ] Footer links resolve: Terms, Privacy, Responsible Gaming, Trust Center, FAQ, Support
- [ ] `/about` shows ALTIVORA LABS LLC entity details

---

## 7. Core player flows (smoke test on real phone)

Complete on a **physical device** (PWA / Add to Home Screen preferred):

- [ ] **Sign up** — account created, confirmation email arrives
- [ ] **Sign in** — magic link or password login works
- [ ] **Deposit** — SquareWallet add funds completes via Stripe Checkout
- [ ] **Contest join** — buy one square on a **$1** board; square appears on board within ~1 min
- [ ] **Withdraw hold** — cash-out setup (Stripe Connect) completes; withdraw request submits without error
- [ ] **Pick'em** — submit at least one pick for current week
- [ ] Error messages are user-friendly (no raw stack traces or internal details)

---

## 8. Mobile app (PWA / Capacitor)

- [ ] Hard refresh or reinstall app after production deploy (clears stale service worker cache)
- [ ] Add to Home Screen works on iOS Safari and Android Chrome
- [ ] Safe-area padding correct on wallet modals and checkout flows

---

## 9. Google Play Console (when publishing Android)

- [ ] One-time $25 Play Console registration complete
- [ ] Upload keystore backed up securely (never lose upload key)
- [ ] Identity verification completed in Play Console
- [ ] Age rating questionnaire submitted with contest/skill-game disclosures
- [ ] `.aab` uploaded to internal or production track
- [ ] App signing SHA-256 fingerprint registered for deep links (if applicable)

See `docs/MOBILE_APP.md` for full Play Console steps.

---

## 10. Post-launch monitoring (first 24 hours)

- [ ] Vercel function logs — no spike in 5xx errors
- [ ] Stripe Dashboard — successful checkouts and webhook deliveries
- [ ] Supabase — no RLS or auth errors in logs
- [ ] Support inbox monitored: support@squareboards.pro
- [ ] Admin repair path ready: `/admin/connect` → inspect/repair player Stripe config

---

## Quick reference

| Item | Value |
|------|-------|
| Production | https://www.squareboards.pro |
| Stripe webhook | `/api/webhooks/stripe` |
| Admin portal | `/admin/login` |
| Trust Center | `/trust` |
| Contest Center | `/contest-center` |

**Deferred (not blocking launch):** formal WCAG audit, additional SEO beyond sitemap, marketing campaigns.
