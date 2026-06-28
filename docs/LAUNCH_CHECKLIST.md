# SquareBoards Launch Checklist

**Production URL:** https://www.squareboards.pro  
**Support:** support@squareboards.pro  
**Last updated:** June 2026

Operator checklist — complete in order before public launch. No feature work; verify infrastructure and core flows only.

**Payment note:** Stripe is not in use and no merchant account is onboarded yet. Sections marked **(soft launch)** apply now; section 3 **(real-money)** is deferred until a processor adapter is live.

---

## 1. Deploy & build

- [ ] `npm run build` passes locally (no TypeScript or build errors)
- [ ] Latest `main` deployed to Vercel Production
- [ ] Vercel deployment shows **Ready** (not failed or rolled back)
- [ ] `SITE_URL` and `NEXT_PUBLIC_APP_URL` set to `https://www.squareboards.pro`
- [ ] `NEXT_PUBLIC_DB_READ_PHASE=2` (Supabase-only reads)
- [ ] **No Stripe env vars** in Production (or leave unset) — soft launch without merchant
- [ ] Do **not** set `NEXT_PUBLIC_LIVE_TRIAL_BANNER=true` until deposits are live
- [ ] Do **not** publish `LIVE_PUBLIC_TRIAL.md` as a real-money launch post yet

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

## 3. Payment processor (real-money — **deferred**)

Skip until a gaming/fantasy-sports-friendly merchant account is approved and an adapter is implemented (`docs/project-legacy/PAYMENT_ENGINE.md`).

- [ ] Processor chosen and merchant account approved
- [ ] `PAYMENT_PROVIDER` set to live adapter (today only `stripe` is implemented)
- [ ] Production API keys + webhook signing secret in Vercel
- [ ] `NEXT_PUBLIC_LIVE_TRIAL_BANNER=true` when deposit-match promo should appear
- [ ] Webhook endpoint registered and returns **200** on test event
- [ ] Payout / cash-out onboarding path verified (today: Stripe Connect — replace when adapter ships)
- [ ] Trust Center and privacy copy updated to name actual processor

**Do not configure Stripe** unless you are re-onboarding Stripe under an approved use case.

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

Complete on a **physical device** (PWA / Add to Home Screen preferred).

### Soft launch (no merchant account)

- [ ] **Sign up** — account created, confirmation email arrives
- [ ] **Sign in** — magic link or password login works
- [ ] **Browse** — contest center and at least one sport board load
- [ ] **Pick'em** — submit at least one pick for current week (if slate is live)
- [ ] **Wallet** — deposit/withdraw either hidden or shows clear “unavailable” messaging (no 500s)
- [ ] Error messages are user-friendly (no raw stack traces or internal details)

### Real-money (after processor onboarded)

- [ ] **Deposit** — SquareWallet add funds completes via checkout
- [ ] **Contest join** — buy one square on a **$1** board; square appears within ~1 min
- [ ] **Withdraw hold** — cash-out setup completes; withdraw request submits without error

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
- [ ] Supabase — no RLS or auth errors in logs
- [ ] Support inbox monitored: support@squareboards.pro
- [ ] When processor is live: payment dashboard + webhook deliveries; admin payout repair path

---

## Quick reference

| Item | Value |
|------|-------|
| Production | https://www.squareboards.pro |
| Payments webhook (Stripe legacy) | `/api/webhooks/stripe` — only if Stripe re-enabled |
| Admin portal | `/admin/login` |
| Trust Center | `/trust` |
| Contest Center | `/contest-center` |

**Deferred (not blocking launch):** formal WCAG audit, additional SEO beyond sitemap, marketing campaigns.
