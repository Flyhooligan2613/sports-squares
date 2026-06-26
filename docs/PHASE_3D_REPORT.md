# Phase 3D — Rewards & Player Progression

**Project:** PROJECT BLACK LABEL  
**Scope:** Rewards home polish, player levels, achievements, progress bars, streaks, history timeline, empty states, micro-celebrations  
**Frozen areas:** Homepage, onboarding, wallet, contest experience — **not modified**

---

## Summary

Phase 3D delivers a premium PlayStation/Duolingo-style rewards experience: clear hierarchy on Rewards Home, Bronze→Elite tier ladder mapped to the existing ecosystem, featured achievement cards wired to real progression data, animated progress goals, motivational streak copy, unified reward history timeline, `AliveEmptyState` across rewards screens, and subtle `MicroCelebration` on achievement unlocks.

---

## Rewards Home (`RewardsDashboardPanel`)

| Section | Detail |
|---------|--------|
| Current Tier | Display name (Bronze→Elite) + level + credits to next |
| Reward Points | Available Tier Credits + weekly earned |
| Progress | Weekly / Monthly / Season / Lifetime animated bars |
| Streaks | Daily login, weekly participation, activity streak copy |
| Lifetime Achievements | 7 featured cards with progress + reward labels |
| Available / Locked | Catalog preview filtered by `minTierSlug` |
| Upcoming Milestones | Next closest locked achievements |
| Empty state | Spec copy via `AliveEmptyState` |

---

## Player Levels (`PlayerTierCard`, `TierProgressPanel`)

| Element | Detail |
|---------|--------|
| Display ladder | Bronze → Silver → Gold → Platinum → Diamond → Elite (+ Hall of Fame, Immortal) |
| Mapping | `TIER_DISPLAY_NAMES` in `rewardsLanguage.ts` → existing `PlayerTierSlug` |
| Tier card | Benefits, requirements, animated progress, login/win streak stats |
| Ladder panel | Per-tier status, benefits, progress to next, credit requirements |

---

## Achievements (`AchievementsPanel`)

| Element | Detail |
|---------|--------|
| Data source | `evaluateAchievements()` from `achievements/catalog.ts` + genesis API |
| Cards | Title, description, progress, reward label, rarity, lock state |
| Celebration | `MicroCelebration` on newly unlocked achievements (subtle confetti) |
| Empty state | Spec-aligned `AliveEmptyState` copy |

Featured home achievements map to catalog IDs: `boards_1`, `wins_1`, `boards_10`, `squares_100`, `login_30`, `community_builder`, `genesis_official_competitor`.

---

## Progress Bars & Streaks

| Type | Source |
|------|--------|
| Weekly | `wallet.weeklyTierCredits` vs goal (100) — **real** |
| Monthly | Sum of tier credit earns in last 30 days from `creditHistory` — **real** |
| Season | Sum of tier credit earns in last 90 days — **real** |
| Lifetime | `tierProgressPct` toward next tier — **real** |
| Daily login streak | `login_streak_days` from profile — **real** |
| Weekly participation | `weeklyTierCredits > 0` — **real** |
| Activity streak | `max(loginStreak, currentWinStreak)` — **real** |

Progress goal targets (`100` / `400` / `1500`) are display thresholds in `PROGRESS_GOALS` — not backend-enforced.

---

## Reward History (`RewardHistoryPanel`)

Unified timeline: Reward Earned, Date, Source, Status, Reference — merged from `creditHistory` (earns) and `redemptionHistory`.

---

## Empty States

| Screen | Context |
|--------|---------|
| Rewards home | `no_rewards` — spec copy |
| Achievements | `no_rewards` with achievements body |
| History | `no_rewards_history` |
| Credit Shop / Marketplace | `no_rewards` |
| My Trophies (inventory) | `no_rewards` with inventory copy |

---

## Micro-interactions & A11y

- `sb-card-lift` on cards and quick links
- `rewards-progress-fill` CSS animation (honors `prefers-reduced-motion`)
- `rewards-achievement-unlock` badge reveal
- Progress bars: `role="progressbar"`, `aria-valuenow`
- Nav links and buttons: `min-h-[44px]` tap targets

---

## Files Changed

| File | Change |
|------|--------|
| `components/player/ecosystem/RewardsDashboardPanel.tsx` | Premium home layout |
| `components/player/ecosystem/RewardsCenterShell.tsx` | Stat hierarchy, tier display |
| `components/player/ecosystem/PlayerTierCard.tsx` | Tier ladder labels, progress, streaks |
| `components/player/ecosystem/TierProgressPanel.tsx` | Full level ladder |
| `components/player/ecosystem/AchievementsPanel.tsx` | Premium cards, celebration, empty states |
| `components/player/ecosystem/RewardHistoryPanel.tsx` | Timeline layout |
| `components/player/ecosystem/RewardsProgressBar.tsx` | **New** shared progress component |
| `components/player/ecosystem/CreditShopPanel.tsx` | Empty state, card lift |
| `components/player/ecosystem/RewardsMarketplacePanel.tsx` | Empty state, card lift |
| `components/player/ecosystem/InventoryPanel.tsx` | Trophies empty state, polish |
| `lib/platform/language/rewardsLanguage.ts` | **New** tier labels, copy, featured achievements |
| `lib/platform/ecosystem/progressionDisplay.ts` | **New** client-safe progress/streak/history helpers |
| `lib/platform/ecosystem/progression.ts` | Re-export display helpers |
| `lib/platform/language/index.ts` | Export rewards language |
| `lib/platform/alive/emptyStateIntelligence.ts` | Spec empty copy for `no_rewards` |
| `app/globals.css` | Progress bar + achievement unlock animations |

---

## Real vs Display Data

| UI Element | Data |
|------------|------|
| Tier, credits, wallet, catalog, inventory | **Real** — `getRewardsCenterData` |
| Achievements unlock/progress | **Real** — legacy stats + genesis IDs |
| Featured achievement reward labels | **Display** — marketing copy in `FEATURED_ACHIEVEMENTS` |
| Progress goal targets (100/400/1500) | **Display** thresholds |
| Upcoming events in Square Drop panel | **Display** (unchanged from prior phase) |
| Achievement unlock dates | Not tracked in DB — omitted (progress only) |

---

## Frozen Areas Confirmed Untouched

- `components/landing/**` (homepage)
- `components/onboarding-queue/**`
- `components/square-wallet/**` (wallet)
- `components/contest-center/**`, contest board/join flows
- No casino/VIP gambling aesthetics introduced

---

## Build

```bash
npm run build
```

---

## The SquareBoards Test™

Strengthens **Progression**, **Identity**, and **Legacy** — rewards feel earned through competition, not spending pressure.
