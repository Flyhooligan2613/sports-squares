# SquarePass™ — Platform Build Specification #009

**Status:** Active Core Platform Engine (#009)  
**Parent:** [Project Legacy (#001)](../PROJECT_LEGACY.md) · [Platform Engineering Standard](./PLATFORM_ENGINEERING_STANDARD.md)

---

## Executive Vision

**SquarePass™** is SquareBoards' dynamic promotion and referral engine. Admin-configured campaigns launch without app updates. Messaging frames rewards as **exclusive opportunities**, never discounts.

---

## Architecture

```
Player UI (PromoCodeRedemption, ReferralHub, SignupBonusReveal)
    ↓
API Routes (/api/square-pass/*)
    ↓
SquarePassEngine™
    ├── PromotionService — campaign CRUD, activation
    ├── ReferralService — vanity codes, milestones, legacy referral bridge
    ├── RedemptionService — code validation, signup bonuses
    ├── RewardDistributionService — XP, badges, frames, tickets, credits
    ├── FraudGuardService — self-referral, duplicates, limits
    ├── CampaignScheduler — auto-activate by date
    └── analyticsAdapter — Command Center stats
    ↓
square_pass_* tables + player_referral_codes
```

### Module layout

| Path | Role |
|------|------|
| `lib/platform/engines/squarePass/SquarePassEngine.ts` | Orchestrator |
| `lib/platform/engines/squarePass/PromotionService.ts` | Campaign CRUD |
| `lib/platform/engines/squarePass/ReferralService.ts` | Referrals & milestones |
| `lib/platform/engines/squarePass/RedemptionService.ts` | Code redemption |
| `lib/platform/engines/squarePass/RewardDistributionService.ts` | Reward grants |
| `lib/platform/engines/squarePass/FraudGuardService.ts` | Fraud protection |
| `components/square-pass/` | Player UI |
| `app/api/square-pass/` | Player API |
| `app/api/admin/square-pass/` | Admin API |
| `app/admin/square-pass/` | Admin UI |
| `supabase/migrations/055_square_pass.sql` | Schema + seed templates |

---

## Integrations

| System | Integration |
|--------|-------------|
| Project Genesis (#008) | Signup bonus campaigns align with Rookie Season; `requiresGenesis` eligibility |
| PaymentEngine / SquareWallet | `wallet_credits`, `marketplace_credits` via ecosystem credits + inventory |
| Command Center (#007) | `getSquarePassAnalytics`, Analytics Center panel |
| Ecosystem Referrals | `applyReferral` bridges to `player_referrals`; milestones extend `player_referral_milestones` |
| Competitor Score | `competitor_score_bonus` column + `scoreBoost.ts` |
| Achievements / Inventory | Badges, frames, tickets via `addInventoryItem` |

---

## Reward types (JSON per campaign)

`xp`, `contest_tickets`, `reward_drops`, `profile_frames`, `badges`, `themes`, `legacy_boosts`, `competitor_score_boost`, `marketplace_credits`, `wallet_credits`

---

## Referral milestones

1 · 5 · 10 · 25 · 50 · 100 qualified referrals — badges, frames, score boosts, legacy spotlight.

---

## Seed campaigns (migration only)

| Slug | Type | Code |
|------|------|------|
| `genesis-signup-welcome` | signup | `WELCOME25` |
| `launch-rookie-ticket` | launch | `LAUNCH2026` |
| `vip-partner-template` | partner | (admin codes) |
| `referral-milestone-engine` | referral | (automatic) |

---

## API routes

**Player:** `POST /api/square-pass/redeem` · `GET /api/square-pass/my-referral` · `POST /api/square-pass/apply-referral` · `GET /api/square-pass/signup-bonus`

**Admin:** `GET/POST /api/admin/square-pass/campaigns` · `GET/PATCH /api/admin/square-pass/campaigns/[id]` · `POST /api/admin/square-pass/codes` · `GET/POST /api/admin/square-pass/analytics`

---

## Deferred

- Full campaign editor UI (rewards JSON builder)
- Wallet credits distributed analytics aggregation
- Cron hook for `CampaignScheduler` (manual via admin POST for now)
- Influencer-specific landing pages

---

## Definition of Done

- [x] Engine + migration + admin CRUD
- [x] Signup + redemption + referral flows
- [x] Player UI components
- [x] Command Center analytics hook
- [x] Fraud logging on all redemptions
- [x] No hardcoded promo logic in app routes
