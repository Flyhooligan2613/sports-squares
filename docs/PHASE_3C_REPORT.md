# Phase 3C — Contest Experience Polish

**Project:** PROJECT BLACK LABEL  
**Scope:** Contest cards, board fill, countdowns, join flow, live board, winner/history, empty states, micro-interactions  
**Onboarding freeze:** Confirmed — no changes to `components/onboarding-queue/**`  
**Wallet freeze:** Confirmed — no changes to SquareWallet panels or wallet engines  
**Homepage freeze:** Confirmed — no changes to `components/landing/` hero or homepage routes

---

## Summary

Phase 3C polishes the full contest journey: scannable contest cards with sport, status, countdown, and board fill indicators; animated fill progress across marketplace and contest center; clearer live game status labels; join success messaging; winner celebration with MicroCelebration; enriched competition history; spec-aligned empty states; board square tap targets and aria-labels; and deferred loading for heavy contest center sections.

---

## Contest Cards

| Element | Detail |
|---------|--------|
| Sport chip | Uppercase sport label on every card |
| Hierarchy | Primary row: Entry Fee + Prize Pool; secondary: Participants, Spots, Game Time |
| Live badge | Pulsing dot + "Live" when status is `live` |
| Countdown | `ContestCountdown` — Registration closes / Game begins / Board locks |
| Board fill | `BoardFillProgress` — "74 / 100 Squares Filled" + Popular / Nearly Full / Sold Out |
| Micro-interactions | `sb-card-lift` on cards and live rows |

**Files:** `ContestCard.tsx`, `FeaturedContestCard.tsx`, `ContestEmptyState.tsx`, `ContestStatusBadge.tsx`

---

## Board Fill Progress

| Change | Detail |
|--------|--------|
| Shared component | `BoardFillProgress.tsx` + `boardFillUtils.ts` |
| Animated bar | `cc-fill-bar-animated` with spring easing |
| Indicators | Popular (≥50%), Nearly Full (≥85%), Sold Out (100%) |
| Marketplace | `BoardFillBar.tsx` delegates to shared component |
| Action Center | `BoardsFillingFast.tsx` uses shared fill UI |

---

## Countdowns

| Surface | Labels |
|---------|--------|
| Contest cards | Registration closes / Game begins / Board locks / Live Now |
| Featured card | Full countdown block with `aria-live="polite"` |
| Live contest rows | Compact inline countdown |
| Countdown Center | "Game begins" instead of generic "Kickoff in" |

**File:** `ContestCountdown.tsx`

---

## Join Flow

| Step | Polish |
|------|--------|
| Success | Headline: "You've successfully joined this contest." |
| Copy source | `CONTEST_JOIN_COPY.successMessage` in `contestLanguage.ts` |
| Purchase page | `PurchaseSuccessContent.tsx` |

---

## Live Board Experience

| Change | Detail |
|--------|--------|
| Square tap targets | `min-h-[44px] min-w-[44px]` on board cells |
| Aria-labels | Available / selected / claimed / locked / winning states |
| Selection feedback | `sbSquareSelect` keyframe on selected squares |
| Live status | `LiveScoreBanner` — Pregame, Q1–Q4, Halftime, OT, Final badges |
| Winner card | `MicroCelebration` confetti + prize amount display |

---

## Competition History

| Field | Shown |
|-------|-------|
| Result | Won {period} |
| Placement | Quarter Winner |
| Prize | Dollar amount |
| Date | Formatted win date |
| Sport | ESPN sport code |
| Contest ID | Pool ID (monospace) |
| CTA | View Details → board link |

**Files:** `RecentWinsTimeline.tsx`, `dashboardTypes.ts`, `playerDashboard.ts`  
**Dashboard section** renamed to "Competition History"

---

## Empty States

| Context | Copy |
|---------|------|
| Contest Center | "No live contests right now. New contests are added regularly. Enable notifications so you never miss kickoff." |
| Steps | Notifications · Pick a contest · Daily Story |

**Files:** `emptyStateLanguage.ts`, `emptyStateIntelligence.ts`, `ContestEmptyState.tsx`

---

## Performance

- `ContestCenterExperience` — `DeferredMount` for Friends, Recommendations, Private sections (viewport lazy load)

---

## Files Changed

### New
- `components/contest-center/BoardFillProgress.tsx`
- `components/contest-center/ContestCountdown.tsx`
- `lib/contestCenter/boardFillUtils.ts`
- `docs/PHASE_3C_REPORT.md`

### Modified
- `components/contest-center/ContestCard.tsx`
- `components/contest-center/ContestStatusBadge.tsx`
- `components/contest-center/FeaturedContestCard.tsx`
- `components/contest-center/ContestEmptyState.tsx`
- `components/contest-center/ContestCenterExperience.tsx`
- `components/marketplace/BoardFillBar.tsx`
- `components/marketplace/GameBoardRow.tsx` (via BoardFillBar)
- `components/action-center/BoardsFillingFast.tsx`
- `components/action-center/CountdownCenter.tsx`
- `components/Board.tsx`
- `components/LiveScoreBanner.tsx`
- `components/WinnerCard.tsx`
- `components/player/RecentWinsTimeline.tsx`
- `components/player/MyGamesDashboard.tsx`
- `app/purchase/success/PurchaseSuccessContent.tsx`
- `lib/contestCenter/buildViewModel.ts`
- `lib/player/dashboardTypes.ts`
- `lib/database/services/playerDashboard.ts`
- `lib/platform/language/contestLanguage.ts`
- `lib/platform/language/emptyStateLanguage.ts`
- `lib/platform/alive/emptyStateIntelligence.ts`
- `app/globals.css`

### Untouched (verified)
- `components/onboarding-queue/**`
- `components/square-wallet/**` (except reused shared UI primitives)
- `components/landing/**` (except reused `LandingGlassCard` — no edits)
- Homepage / landing pages

---

## Verification

- `npm run build` — must pass before merge
- Manual smoke: contest center cards, board square selection, purchase success copy, competition history details, empty contest state
