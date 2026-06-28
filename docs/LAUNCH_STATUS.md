# Launch Status — Automated Verification

**Date:** June 26, 2026  
**Branch:** `main` @ `f8bc677` (up to date with `origin/main`)  
**Verdict:** **SOFT LAUNCH GO** — platform checks pass; **real-money flows blocked** until a payment processor merchant account is onboarded.

---

## Payment posture

| Mode | Status |
|------|--------|
| Stripe | **Not in use** — account closed; code still has Stripe adapter as default |
| Merchant account | **Not onboarded yet** |
| SquareWallet™ ledger | **Ready** — internal balances; needs processor for deposits/withdrawals |
| Migrations 061 / 062 | **Applied** (deposit-match bonus + premium emojis) |

**Works without merchant:** sign up, sign in, browse boards, pick'em (free/credit paths if funded), trust center, admin, PWA.  
**Blocked without merchant:** card deposits, Stripe Checkout contest entry, cash-out, withdrawals, play eligibility that requires Connect.

See `docs/project-legacy/PAYMENT_ENGINE.md` for adapter pattern when a processor is chosen.

---

## ✅ Automated checks passed

| Check | Result |
|-------|--------|
| `npm run build` | **PASS** — 161 pages, typecheck clean, sitemap generated |
| Git on `main`, latest pushed | **PASS** |
| Migrations `061`, `062` | **APPLIED** — deposit match bonus + premium emojis |
| Broken `/auth/login` links | **PASS** — none found |
| Sitemap `/games/*` routes | **PASS** |
| Trust Center `/trust` | **PASS** — hub + 12 policies + 4 merchant docs |
| Wallet APIs (ledger) | **PASS** — `app/api/square-wallet/*` |
| Auth routes | **PASS** — 20 routes under `app/api/auth/*` |
| Admin Command Center | **PASS** |
| Footer legal links | **PASS** |

---

## ⏳ Operator steps — soft launch (now)

1. **Supabase** — Confirm migrations through `062`. Auth Site URL + redirect `https://www.squareboards.pro/auth/callback`. `SUPABASE_SERVICE_ROLE_KEY` + `CRON_SECRET` in Vercel Production.

2. **Vercel Production** — `SITE_URL` and `NEXT_PUBLIC_APP_URL` = `https://www.squareboards.pro`, `NEXT_PUBLIC_DB_READ_PHASE=2`. Deploy latest `main`; deployment **Ready**.

3. **Production smoke test (no money)** — Sign up, sign in, browse contest center, pick'em slate, trust center, PWA install. Confirm deposit/withdraw UI shows appropriate unavailable state (not a crash).

4. **Google Play Console** (if shipping Android) — Registration, identity verification, age rating, `.aab` upload, keystore backup.

---

## ⏸ Deferred until merchant account

1. Choose gaming/fantasy-sports-friendly payment processor
2. Implement `PaymentProvider` adapter (or restore Stripe if policy allows)
3. Provider webhook route + production keys in Vercel
4. Replace Connect-equivalent payout onboarding for withdrawals
5. Update trust copy (privacy policy still references Stripe in places)
6. **Full-money smoke test** — deposit, $1 contest square, withdraw hold

**Skip:** Stripe live keys, `/api/webhooks/stripe` setup, `/admin/connect` repair — not applicable until a processor is live.

---

## Optional (recommended)

- `RESEND_API_KEY` + `RESEND_FROM_EMAIL` for magic links
- `VAPID_*` keys if push enabled
- `npm run marketplace:sync` and `npm run pickem:sync`
- Monitor Vercel/Supabase logs first 24h; support@squareboards.pro inbox
- When payments go live: `NEXT_PUBLIC_LIVE_TRIAL_BANNER=true` + processor dashboard monitoring

---

## Reference

- Checklist: `docs/LAUNCH_CHECKLIST.md`
- Audit: `docs/EXECUTIVE_AUDIT_REPORT.md`
- Production: https://www.squareboards.pro
