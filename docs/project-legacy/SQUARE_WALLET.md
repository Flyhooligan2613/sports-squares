# SquareWallet™ 2.0 — Platform Build Spec #011

**Status:** Active  
**Parent:** [PaymentEngine™ (#005)](./PAYMENT_ENGINE.md) · [Project Legacy](../PROJECT_LEGACY.md)

---

## Executive Vision

**SquareWallet™ 2.0** is the platform-owned financial hub where competitors fund competition — not contests directly. All money flows:

```
Competitor → SquareWallet™ → PaymentEngine™ → Provider Adapter → Merchant
```

No direct Stripe (or merchant) imports in app code.

---

## Architecture

| Module | Role |
|--------|------|
| `lib/platform/engines/payment/wallet/SquareWalletEngine.ts` | Orchestrator singleton |
| `WalletLedgerService.ts` | Balance types + immutable ledger mutations |
| `WalletLifecycleService.ts` | Auto-create wallet on signup |
| `DepositService.ts` | Add funds via PaymentEngine checkout |
| `WithdrawalService.ts` | Request/process withdrawals via PaymentEngine payout |
| `ContestFundingService.ts` | Deduct contest entries from typed balances |
| `WinningsService.ts` | Credit prizes; pending → available logic |
| `SmartWalletService.ts` | Contextual recommendations |
| `TaxCenterService.ts` | Yearly stats + export stubs (ComplianceEngine placeholder) |
| `repository.ts` | Supabase access for wallets, balances, ledger |

### Database (`058_square_wallet_2.sql`)

- `square_wallets` — account + lifetime stats
- `square_wallet_balances` — typed balance buckets
- `square_wallet_ledger_entries` — immutable ledger (links to `payment_transactions`)

Migration `034_player_payment_wallet.sql` was a placeholder; **058 is authoritative**.

---

## Balance Types

| Type | Purpose |
|------|---------|
| `available` | Cash-equivalent — withdrawable, contest entry |
| `pending_winnings` | Credited prizes awaiting release |
| `pending_withdrawals` | In-flight cash-out requests |
| `contest_credits` | Platform contest credits |
| `bonus_credits` | Bonus / promo engine credits |
| `reward_credits` | RewardCore credits |
| `promotional` | Campaign credits (deducted first) |
| `referral` | Referral program credits |

**Contest entry deduction order:** promotional → referral → reward → bonus → contest → available.

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/square-wallet/dashboard` | GET | Balances, stats, recent ledger |
| `/api/square-wallet/deposit` | POST | Initiate deposit checkout |
| `/api/square-wallet/withdraw` | POST | Request withdrawal |
| `/api/square-wallet/transactions` | GET | Paginated history |
| `/api/square-wallet/smart-recommendations` | GET | Smart wallet cards |
| `/api/square-wallet/export` | POST | Export stub |

Player UI: `/my-games/wallet`

---

## Integration Points

| Site | Integration |
|------|-------------|
| `lib/auth/playerSignup.ts` | `SquareWalletEngine.ensureWallet()` |
| `app/api/purchase/checkout` | `ContestFundingService.chargeForEntry()` first |
| `app/api/purchase/fast-checkout` | Same wallet-first path |
| `lib/payouts/payoutJobs.ts` | `WinningsService.creditWinnings()` (default) |
| Webhook | `PURCHASE_TYPE_WALLET_DEPOSIT` → credit available |
| Command Center | Wallet analytics in `paymentAdapter` |

Set `SQUARE_WALLET_LEGACY_STRIPE_PAYOUTS=true` to restore direct Connect transfers on payout jobs.

---

## Post-Win Experience

1. `WinningsCelebrationModal` — celebration first  
2. `PostWinOptionsModal` — Keep Competing / View Rewards / Save in Wallet / Withdraw Later  
3. Never push withdrawal immediately

---

## Security (stubs)

- Large withdrawal review: `LARGE_WITHDRAWAL_REVIEW_CENTS` (default $500)  
- Audit: all flows record via `TransactionCenter`  
- ComplianceEngine: `TaxCenterService` export hooks

---

## Non-Goals (deferred)

- Full TaxCenter / 1099 export  
- ComplianceEngine automated review workflow  
- Team / family / gift card balance types  
- Real-time push on win (EventEngine subscriber for modal)
