# SquareBank™ — Platform Build Spec #012

**Status:** Active  
**Parent:** [SquareWallet™ (#011)](./SQUARE_WALLET.md) · [PaymentEngine™ (#005)](./PAYMENT_ENGINE.md)

---

## Executive Vision

**SquareBank™** is the platform financial source of truth — not customer-facing. Competitors interact with **SquareWallet™** (presentation layer); all balance mutations flow through SquareBank immutable ledger APIs.

```
Competitor UI → SquareWallet™ (facade) → SquareBank™ (ledger truth) → PaymentEngine™ (providers)
```

---

## Architecture

| Module | Role |
|--------|------|
| `SquareBankEngine.ts` | Public orchestrator — `postEntry()`, reconciliation, health |
| `AccountService.ts` | Auto-create financial account on registration |
| `LedgerService.ts` | Immutable append-only ledger postings |
| `BalanceService.ts` | Read/update balances ONLY via ledger |
| `TransactionIdService.ts` | `SQ-YYYY-00000012345` IDs |
| `AuditTrailService.ts` | Timestamp, player, device, IP, before/after balances |
| `ReconciliationService.ts` | Daily/weekly/monthly PaymentEngine vs ledger vs contests |
| `ComplianceService.ts` | Fraud hold, velocity, large withdrawal, KYC stubs |
| `DisputeService.ts` | Transaction detail, timeline, resolution |

### Database (`059_square_bank.sql`)

- `square_bank_accounts` — links to player email + `square_wallets.id`
- `square_bank_ledger` — immutable entries (never UPDATE/DELETE in app)
- `square_bank_balances` — materialized from ledger postings
- `square_bank_audit_trail` — compliance audit stream
- `square_bank_reconciliation_runs` — reconciliation snapshots
- `square_bank_disputes` — dispute cases
- `square_bank_transaction_seq` — SQ- ID sequence per year

Migration syncs existing `058` wallet data into bank accounts.

---

## Account Types

| Type | Wallet Presentation |
|------|---------------------|
| `available_cash` | `available` |
| `pending_cash` | `pending_winnings` |
| `reserved_funds` | `pending_withdrawals` |
| `contest_credits` | `contest_credits` |
| `bonus_credits` | `bonus_credits` |
| `reward_credits` | `reward_credits` |
| `promotional_credits` | `promotional` |
| `referral_credits` | `referral` |
| `locked_funds` | internal only |
| `marketplace_credits` | future stub |

---

## Ledger Entry Types

`deposit`, `contest_entry`, `contest_refund`, `contest_cancellation`, `contest_prize`, `withdrawal_request`, `withdrawal_approved`, `withdrawal_completed`, `bonus_credit`, `squarepass_reward`, `referral_reward`, `reward_drop`, `manual_adjustment`, `admin_adjustment`, `chargeback`, `reversal`, `fraud_hold`, `tax_adjustment`, `winnings_release`, `transfer`

---

## API Routes (admin/internal)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/square-bank/reconcile` | GET | Run reconciliation |
| `/api/square-bank/health` | GET | Financial health metrics |
| `/api/square-bank/disputes` | GET/POST | List/open disputes |
| `/api/square-bank/disputes/[id]` | GET/PATCH | Detail/resolve dispute |
| `/api/admin/command-center/finance` | GET | Command Center financial dashboard |

Admin UI: `/admin/command-center/finance`, `/admin/square-bank/disputes`

---

## Integration Points

| Service | SquareBank Entry |
|---------|------------------|
| `WalletLedgerService` | All credits/debits via `postEntry()` |
| `ContestFundingService` | `contest_entry` |
| `WinningsService` | `contest_prize` |
| `DepositService` | `deposit` |
| `WithdrawalService` | withdrawal flow + compliance |
| `RewardDistributionService` | `squarepass_reward`, `referral_reward`, `bonus_credit` |
| `payoutJobs.ts` | via `SquareWalletEngine.creditWinnings` → bank |
| `playerSignup.ts` | `ensureAccount()` + wallet |

---

## Rules

- **Immutable ledger** — no overwrites or deletes in application code
- **Unique SQ- transaction IDs** — via `square_bank_transaction_seq`
- **SquareWallet = presentation only** — never mutate balances directly
- **PaymentEngine records provider refs** — SquareBank records ledger truth
- Do not alter payout calculation amounts

---

## Deferred / Gaps

- Full KYC provider integration (stub hooks only)
- Automated fraud hold triggers from FraudGuard
- Marketplace credits spend flow
- DB-level triggers to enforce ledger immutability (RLS insert-only on ledger)
- Ecosystem `addSquareCredits` dual-write — migrate fully to bank-only in future sprint
