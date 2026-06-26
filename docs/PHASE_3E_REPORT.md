# Phase 3E — Player Profiles & Community

**Project:** PROJECT BLACK LABEL  
**Scope:** Premium competitor profiles, stats grid, share card, activity feed, follow system, achievements (earned + locked), leaderboard → profile links, empty states, micro-interactions  
**Frozen areas:** Homepage, onboarding, wallet, rewards, contest experience — **not modified** (profile/community link fixes only in Huddle cards and global search)

---

## Summary

Phase 3E delivers Xbox/PlayStation-style competitor identity on public and private profiles: premium header with tier banner, `PlayerStatsGrid`, screenshotable `PlayerShareCard`, unified `PlayerActivityFeed`, polished follow UI with mutual connections, earned + locked achievements, leaderboard rows linking to `/profile/[username]`, and spec-aligned `AliveEmptyState` copy for empty activity and followers.

---

## Profile Header (`ProfileHeader`, `ProfileSocialView`)

| Element | Detail |
|---------|--------|
| Avatar | Tier-framed emoji from huddle/ecosystem — **real** |
| Username | `@username` from huddle summary — **real** |
| Display name | Public label from legacy — **real** |
| Verified badge | `isVerified` from huddle — **real** |
| Tier / rank | Tier name + creator level — **real** |
| Member since | Account join date — **real** |
| Favorite sport | `favoriteTeam` when set — **real** |
| Online status | Not wired (no live presence API) — **omitted** |
| Follow | `FollowButton` with `MicroCelebration` on follow — **real** |
| Mutual connections | Intersection of viewer following + profile followers — **real** |

---

## Player Statistics (`PlayerStatsGrid`, `ProfileLegacySections`)

| Stat | Source |
|------|--------|
| Contests | `stats.boardsPlayed` — **real** |
| Won | `stats.lifetimeWins` — **real** |
| Win % | Computed from wins / boards — **real** |
| Squares purchased | `stats.totalSquaresPurchased` — **real** |
| Streaks | `currentWinStreak`, `longestWinStreak` — **real** |
| Season / lifetime rank | Leaderboard `viewerRank` boards — **real** |
| Reward tier | Huddle tier name — **real** |
| Achievements | `buildAchievements()` earned + locked — **real** |
| Verification | Profile `isVerified` badge — **real** |

---

## Share-worthy Player Card (`PlayerShareCard`)

Premium card with avatar, username, tier, win %, season rank, favorite team, top achievements, verified badge. Native share API + clipboard fallback. OG image route unchanged at `/profile/[username]/opengraph-image`.

---

## Activity Feed (`PlayerActivityFeed`)

Timeline merges API feed (wins, pick cards) with profile milestones (joined, verified, achievements, rankings). Uses `AliveEmptyState` context `no_profile_activity` with spec copy.

---

## Follow System

| Feature | Implementation |
|---------|----------------|
| Follow / unfollow | `/api/huddle/follow` — **real** |
| Counts | Synced via `huddle_player_follows` — **real** |
| Follower / following modals | `FollowListModal` with profile links — **real** |
| Mutual connections | `listFollowingSet` ∩ followers — **real** |
| Follow notification | Reputation delta on follow; push not wired — **partial** |

---

## Leaderboard → Profile

`LeaderboardEntry` extended with `slug` and `avatarEmoji`. Rows with slugs link to `publicProfilePath(slug)`. Profile stats link back to `/leaderboards`.

---

## Achievements Display

Public profile and Competitor Card show **earned + locked** achievements from `lib/player/achievements.ts` + genesis badges. Locked cards use 🔒 and reduced opacity.

---

## Empty States

| Context | Copy |
|---------|------|
| `no_profile_activity` | "Your competition history will begin after your first contest." |
| `no_followers` | "As you compete and build your reputation, other players can follow your journey." |
| Leaderboard empty | Existing `no_leaderboard` |

---

## Profile Link Fixes (community bug fixes)

Canonical `/profile/[username]` links in: `PickPostCard`, `SurvivorPostCard`, `PickOfWeekBanner`, `GlobalSearchProvider`, `FollowListModal`, `CommunityPanel`.

---

## Files Changed

### New
- `components/player/PlayerStatsGrid.tsx`
- `components/player/PlayerShareCard.tsx`
- `components/player/social/ProfileHeader.tsx`
- `components/player/social/FollowButton.tsx`
- `components/player/social/FollowListModal.tsx`
- `components/player/social/PlayerActivityFeed.tsx`
- `docs/PHASE_3E_REPORT.md`

### Modified
- `components/player/PublicPlayerView.tsx`
- `components/player/ProfileLegacySections.tsx`
- `components/player/social/ProfileSocialView.tsx`
- `components/leaderboards/LeaderboardsCenter.tsx`
- `components/competitor-card/AchievementsGrid.tsx`
- `components/competitor-card/CommunityPanel.tsx`
- `components/huddle/PickPostCard.tsx`
- `components/huddle/SurvivorPostCard.tsx`
- `components/huddle/PickOfWeekBanner.tsx`
- `components/search/GlobalSearchProvider.tsx`
- `lib/player/publicProfileTypes.ts`
- `lib/player/leaderboardTypes.ts`
- `lib/database/services/leaderboards.ts`
- `lib/database/services/playerProfiles.ts`
- `lib/huddle/profileSocial.ts`
- `lib/platform/alive/emptyStateIntelligence.ts`
- `lib/competitorCard/buildCompetitorCard.ts`

### Frozen (untouched)
- Homepage (`HomeExperience`, etc.)
- Onboarding flows
- Square Wallet dashboard
- Rewards panels (Phase 3D)
- Contest center / pool purchase UX

---

## Build

```
npm run build — passed
```

---

## The SquareBoards Test™

Strengthens **Identity**, **Community**, **Reputation**, and **Legacy** without social chat or DMs — premium competitive player cards competitors can share proudly.
