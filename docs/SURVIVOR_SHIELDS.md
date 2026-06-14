# Survivor Shields™ — Executive Directive #008

Premium strategic mechanic exclusive to **Survivor X™** on SquareBoards.

## Philosophy

Every player begins the season believing: *"I still have one chance."* Shields increase suspense — they do not remove consequences. Once consumed, a shield is gone forever.

## Rules

- **One shield per player per season** — not purchasable, not random
- **Auto-activation** when the player's picked team loses (no manual button)
- **No shield on missed picks** — only applies when a team was selected and lost
- Shields consume **before** league lives (Double Life compatibility)
- Order: Shield → Lives → Eliminated

## Database (`045_survivor_shields.sql`)

| Table / column | Purpose |
|----------------|---------|
| `survivor_entries.shield_available` | Whether shield remains |
| `survivor_entries.shield_used_week` | Week shield auto-deployed |
| `survivor_picks.result = shield_saved` | Pick resolved via shield |
| `survivor_shield_uses` | Audit trail (future seasonal designs) |
| `survivor_career_stats.shield_saves_lifetime` | LegacyCore™ |

## Engine

Primary hook: `processSurvivorLoss()` in `lib/survivor/db/entries.ts`

Sync resolution: `lib/survivor/engine/syncLeague.ts` → `resolveWeekPicks()`

## Events (EventEngine™)

| Event | When |
|-------|------|
| `survivor.shield_activated` | Shield auto-deploys on loss |
| `survivor.shield_depleted` | Player's only shield consumed |

Subscribers: `survivorLegacyHandler`, `survivorLiveCoreHandler`

## UI

- `SurvivorShieldBadge` — profile status (Available / Used Week N)
- `SurvivorShieldActivation` — full-screen ceremony (respects `prefers-reduced-motion`)
- Live Survival Map tile: Shields Activated

## Achievements (LegacyCore™ badges)

| Badge | Trigger |
|-------|---------|
| `guardian` | First shield use |
| `last_stand` | Win season after using shield |
| `untouchable` | Win season without using shield |

## Fairness

Exactly one shield per entry. No purchases. No pay-to-win.

## Future expansion

`shield_design` column supports seasonal / championship / holiday variants without core mechanic changes.

Full Survivor X spec: `docs/SURVIVOR_X.md`
