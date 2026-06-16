# PodiumEngine™ — Core Platform Engine

**Status:** Active Core Platform Engine  
**Parent:** [Project Legacy (#001)](../PROJECT_LEGACY.md) · [Platform Engineering Standard](./PLATFORM_ENGINEERING_STANDARD.md)

---

## Executive Vision

**PodiumEngine™** is the permanent Core Platform Engine for ranked competition finishes across SquareBoards. It elevates podium resolution from a Pick'em feature into a reusable service alongside ContestEngine, RewardCore, Legacy, and EventEngine.

Any ranked competition registers an adapter. PodiumEngine orchestrates standings resolution, cash splits, platform rewards, ceremony events, and career stat recording through a single pipeline.

---

## Architecture

```
Contest completes
    ↓
PodiumEngine.process(PodiumContestResult)
    ↓
Adapter (standings + prize pool + hooks)
    ↓
orchestrator.ts
    ├── resolvePodium()
    ├── awardPodium() → RewardCore, recordPodiumFinishes
    ├── buildPodiumCeremony()
    └── publishPlatformEvent (podium.ceremony, podium.awarded, podium.near_perfect)
    ↓
EventEngine subscribers (Legacy, Community, Notifications, Analytics, …)
```

### Module layout

| Path | Role |
|------|------|
| `lib/platform/engines/podium/PodiumEngine.ts` | Main service singleton — `process()` |
| `lib/platform/engines/podium/orchestrator.ts` | Single pipeline |
| `lib/platform/engines/podium/registry.ts` | Adapter registry by `PodiumContestKind` |
| `lib/platform/engines/podium/adapters/` | Contest-specific adapters |
| `lib/platform/engines/podium/ceremony.ts` | Podium Ceremony™ copy generation |
| `lib/platform/engines/podium/recordFinishes.ts` | `recordPodiumFinishes` — Competitor Card path |
| `lib/platform/engines/podium/config.ts` | `podiumEngine` schema + env overrides |

`lib/platform/podium/` re-exports from `engines/podium/` for backward compatibility.

---

## Adapter Pattern

Adapters supply **only** contest-specific data. They never duplicate reward logic.

```typescript
interface PodiumContestAdapter {
  kind: PodiumContestKind;
  resolveStandings(input: PodiumContestResult): Promise<PodiumStandingsEntry[]>;
  getPrizePool(input: PodiumContestResult): Promise<number>;
  getConfig?(): Promise<PodiumConfig>;
  onAwarded?(input: { contestResult; resolution; award }): Promise<void>;
}
```

### Registered adapters

| Kind | Adapter | Status |
|------|---------|--------|
| `pickem_weekly` | `pickemWeeklyAdapter` | **Wired** — all sports |
| `pickem_season` | `pickemSeasonAdapter` | **Wired** |
| `tournament_royale` | `tournamentRoyaleAdapter` | **Scaffold** — needs standings context |
| `survivor` | `survivorAdapter` | **Scaffold** |
| `bracket` | `bracketsAdapter` | **Scaffold** |

---

## Enable Podium for a New Contest (3 steps)

### 1. Create an adapter

```typescript
// lib/platform/engines/podium/adapters/myContest.ts
export const myContestAdapter: PodiumContestAdapter = {
  kind: "my_contest_kind",
  async resolveStandings(result) { /* return ranked entries */ },
  async getPrizePool(result) { /* return cents */ },
  async onAwarded({ contestResult, resolution, award }) {
    /* contest-specific persistence only */
  },
};
```

### 2. Register the adapter

```typescript
import { registerPodiumAdapter } from "@/lib/platform/engines/podium/registry";
registerPodiumAdapter(myContestAdapter);
```

Add registration to `adapters/index.ts`.

### 3. Call PodiumEngine at resolution

```typescript
import { processContestPodium } from "@/lib/platform";

const outcome = await processContestPodium({
  kind: "my_contest_kind",
  contestId,
  label: "My Contest Final",
  context: { /* adapter-specific data */ },
});
```

Enable via admin `podiumEngine` config or `PODIUM_ENGINE_CONFIG_JSON` env.

---

## Configuration

### Ecosystem admin (`podiumEngine`)

```typescript
{
  enabled: false,
  defaultConfig: { /* PodiumConfig */ },
  topN: { enabled: false, maxPlacements: 3 },
  ceremonyTemplates: { headline, first, second, third, nearPerfect },
  contestKindOverrides: { pickem_weekly: { cashSplit: { ... } } },
  geoChampionships: { enabled: false, scopes: ["global", "national", "regional", "league"] },
  seasonal: { enabled: true },
  sponsoredEvents: { enabled: false }
}
```

### Environment

- `PODIUM_ENGINE_CONFIG_JSON` — full engine override
- `PODIUM_CONFIG_JSON` — legacy partial override (maps to `defaultConfig`)
- `PODIUM_ENGINE_ENABLED=true` or `PODIUM_ENABLED=true` — enable globally

Default: **disabled** (`enabled: false`) — existing Pick'em legacy flow preserved.

---

## Platform Events

| Event | When |
|-------|------|
| `podium.ceremony` | After resolution, before adapter hooks |
| `podium.awarded` | Per placement (tier credits, badges) |
| `podium.near_perfect` | Per Near Perfect™ candidate |

Subscribers handle notifications, achievements, HOF, timeline, community — do not duplicate in adapters.

---

## Integration Checklist

- [ ] Adapter implements `resolveStandings` + `getPrizePool`
- [ ] Adapter registered in `adapters/index.ts`
- [ ] Resolution site calls `processContestPodium`
- [ ] Contest-specific persistence in `onAwarded` only
- [ ] `contest_kind` added to `podium_finishes` check constraint if new kind
- [ ] `podiumEngine.contestKindOverrides` configured if needed
- [ ] Event subscribers wired (notifications use `notificationLanguage` templates)
- [ ] Competitor Card reads `getPodiumCareerStats` (via `recordPodiumFinishes`)

---

## Future Expansion (config schema only)

- **Top 5/10** — `PodiumPlacementConfig.topN`, `podiumEngine.topN`
- **Geo championships** — `PodiumGeoScope`, `geoChampionships`
- **Seasonal** — `podiumEngine.seasonal`
- **Sponsored events** — `podiumEngine.sponsoredEvents`
- **Team/league** — `leagueId` on `PodiumContestResult`

---

## Non-Goals

- Full top-N payout implementation (schema ready)
- Geo/seasonal championship flows (config scaffold only)
- Breaking Pick'em legacy single-winner path when disabled

---

## Definition of Done

- PodiumEngine exported from `lib/platform/index.ts`
- Pick'em uses adapter + `processContestPodium` only
- All finishes via `recordPodiumFinishes`
- Build passes · default disabled · no duplicated reward logic in adapters
