# Fraud Prevention — SquareBoards

Operator and engineering reference for identity, payments, and abuse controls.

---

## Implemented (code + migration `063_signup_identity_fraud.sql`)

| Control | Detail |
|---------|--------|
| **Required signup fields** | Email, phone, date of birth (21+), full mailing address |
| **One account per email** | Supabase Auth + `player_profiles.email` |
| **One account per phone** | Unique index `player_profiles_phone_uidx` (migration 035) + pre-signup check |
| **Shared household address** | Address is **not** unique — multiple accounts may share the same street/ZIP |
| **Age gate** | `date_of_birth` required; must be 21+ at signup |
| **Billing ZIP match** | Stripe Checkout collects billing address; webhook verifies card ZIP matches profile `postal_code` (first 5 digits) before fulfilling deposits, squares, or Pick'em purchases |
| **Signup rate limit** | `RATE_LIMITS.signup` per IP on `/api/auth/signup` |
| **Fraud signal log** | `fraud_signal_log` table — duplicate email/phone attempts, billing ZIP mismatch |
| **Device tracking** | Device key on signup/sign-in (`completePlayerSignIn`) |
| **Withdrawal holds** | Migration 061 — rapid deposit→withdraw, large withdrawal review |
| **Admin policy** | No manual wallet overrides (`lib/platform/core/adminPolicy.ts`) |

### Apply migration 063

```sql
-- Run in Supabase SQL Editor: supabase/migrations/063_signup_identity_fraud.sql
```

---

## Recommended — industry standard (defer / phase in)

Sports betting and DFS platforms typically layer these on top of identity:

### Identity & KYC
- **Government ID verification** (Socure, Persona, Jumio, Onfido) — match name/DOB/address to ID
- **SSN last-4 / full SSN** for tax reporting (1099) and enhanced KYC
- **Phone OTP verification** — confirm possession of number (Twilio Verify)
- **Email verification link** before first deposit (Supabase can require `email_confirm`)
- **Re-KYC** on large withdrawals or profile address change

### Payments
- **3-D Secure (SCA)** on card deposits
- **Duplicate payment method fingerprinting** — block same card across multiple accounts
- **AVS full match** (address + ZIP), not ZIP-only when processor supports it
- **ACH micro-deposit verification** for bank accounts
- **Block prepaid / virtual cards** for deposits (BIN rules)

### Velocity & limits
- **Daily / weekly deposit caps** per player and per payment method
- **Withdrawal cooldown** after first deposit (already partially in 061)
- **Max withdrawal per day** without manual review
- **Contest entry velocity** — cap rapid purchases

### Geolocation & eligibility
- **IP geolocation** — block or allowlist states where skill contests are permitted
- **GPS / device location** on mobile for real-money play (where required)
- **VPN / proxy detection**

### Account linking & abuse
- **Device fingerprint** clustering — flag multiple accounts on one device
- **Behavioral analytics** — collusion, chip dumping, bonus abuse
- **Referral fraud** — device/IP caps on referral bonuses (partially in SquarePass)
- **Chargeback monitoring** — auto-suspend on dispute patterns

### Operations
- **OFAC / sanctions screening** on payouts
- **PEP screening** for high-value players
- **Manual review queue** for flagged signals (admin Command Center extension)
- **SAR workflow** for suspicious activity

---

## Key files

| Area | Path |
|------|------|
| Signup validation | `lib/auth/playerSignup.ts`, `lib/fraud/identity.ts` |
| Signup UI | `components/auth/SignupWelcomeModal.tsx` |
| Billing ZIP | `lib/fraud/billingZip.ts`, `lib/platform/engines/payment/adapters/stripe/webhookHandlers.ts` |
| Fraud audit | `lib/fraud/signals.ts`, `fraud_signal_log` table |
| Rate limits | `lib/security/rateLimit.ts` |

---

## Operator notes

- **Soft launch without merchant:** Signup identity rules apply now; billing ZIP check runs when Stripe (or future processor) webhooks fire.
- **Profile edits:** If a player changes address ZIP, future card charges must use the updated ZIP or payment will fail fulfillment.
- **Support script:** “Use a debit card billed to the same ZIP you entered at sign-up.”
