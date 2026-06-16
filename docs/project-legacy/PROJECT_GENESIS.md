# Project Genesis™ — Platform Build Specification #008

**Status:** Active Core Platform Engine (#008)  
**Parent:** [Project Legacy (#001)](../PROJECT_LEGACY.md) · [Platform Engineering Standard](./PLATFORM_ENGINEERING_STANDARD.md)

---

## Executive Vision

**Project Genesis™** guides every new competitor through their first 30 minutes on SquareBoards — replacing blank empty states with purposeful rookie missions, starter achievements, and contextual next steps. Integrated into existing flows; no separate onboarding wizard.

---

## Architecture

```
Player UI (profile, my-games, contest center, huddle, achievements)
    ↓
components/genesis/* + GenesisProvider
    ↓
API Routes (/api/genesis/*)
    ↓
GenesisEngine™ (orchestrator)
    ├── RookieSeasonService
    ├── MissionCenterService
    ├── NextStepEngine
    ├── CareerProgressService
    ├── DailyMotivationService
    ├── FirstWinExperience / FirstLossExperience
    └── score.ts (200 starting Competitor Score floor)
    ↓
genesis_mission_progress + player_profiles genesis columns
```

### Module layout

| Path | Role |
|------|------|
| `lib/platform/engines/genesis/GenesisEngine.ts` | Main orchestrator |
| `lib/platform/engines/genesis/MissionCenterService.ts` | Missions, XP, rewards |
| `lib/platform/engines/genesis/config.ts` | Mission definitions, copy |
| `components/genesis/` | Rookie UI components |
| `app/api/genesis/` | Authenticated player API |
| `supabase/migrations/054_project_genesis.sql` | Schema |

---

## Rookie Season

- Auto-starts on account creation (`registerPlayerAccount`)
- 30-day window (`ROOKIE_SEASON_DAYS`)
- Starter achievements unlocked immediately
- Profile customization unlocked for rookies (bio, team, theme, frame)

---

## Missions

| Mission | Reward |
|---------|--------|
| Complete Profile | 100 XP |
| Join First Contest | 250 XP |
| Follow Three Competitors | Competitor Badge |
| Upload Profile Picture | Rookie Avatar Frame |
| Visit Trophy Room | 50 XP |
| Open Community Feed | 25 XP |
| View Today's Contests | Contest Explorer Badge |
| Complete First Contest | Rookie Champion Badge |

Visit-tracked missions complete via `GenesisVisitTracker` or `useGenesisPageVisit`.

---

## Competitor Score

New genesis accounts with zero contests receive a **200** merit floor (`GENESIS_STARTING_COMPETITOR_SCORE`). Explained via `CompetitorScoreExplainer` — never from deposits or purchases.

---

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/genesis/missions` | GET | Mission catalog + progress |
| `/api/genesis/progress` | GET | Full genesis snapshot |
| `/api/genesis/next-step?context=` | GET | Contextual next action |
| `/api/genesis/career` | GET | Career rank + motivation |
| `/api/genesis/complete-mission` | POST | Complete visit/manual mission |
| `/api/genesis/celebrate-first-win` | POST | Dismiss first win overlay |

---

## Integration points

- **Signup:** `lib/auth/playerSignup.ts` → `initializeGenesisAccount`
- **My Games layout:** `GenesisProvider` + `FirstWinCelebration`
- **Profile:** `CompetitorCardExperience` — banners, missions, customization
- **Contest Center / Huddle:** `GenesisVisitTracker`
- **Achievements:** genesis category in ecosystem catalog
- **Empty states:** `GenesisEmptyState` + `NextStepCard`

---

## Non-Goals

- Separate onboarding wizard
- Full player UX redesign
- Removing existing features

---

## Deferred

- First loss auto-detection (overlay component exists; hook when contest result pipeline emits loss events)
- Theme color persistence to DB column
- Banner image upload
- Favorite sport picker (team field available now)

---

## Definition of Done

- [x] Genesis engine + migration + APIs
- [x] Starter achievements on signup
- [x] Empty state replacements (profile, trophy, achievements, community, contests)
- [x] Mission Center on profile
- [x] 200 starting Competitor Score + explainer
- [x] `npm run build` passes
