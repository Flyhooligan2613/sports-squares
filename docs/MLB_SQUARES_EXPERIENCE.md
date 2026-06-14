# Executive Product Directive #005 — Build the MLB Squares Experience

**Status:** Active product direction  
**Effective:** June 2026  
**Parent:** [Project Legacy (#001)](./PROJECT_LEGACY.md)

---

## Objective

Build the **world's premier digital MLB Squares experience**.

This is **not** a copy of NFL Squares. This is **not** an expansion. This is the **second flagship experience** inside the SquareBoards platform.

MLB Squares should provide **daily engagement** throughout baseball season while remaining simple enough to learn in **under one minute**.

Premium · Automated · Exciting · Deeply integrated into the ecosystem.

### Company philosophy (reinforced)

- Every Fan Has A Chance  
- There Is No Wait Line  
- Build Moments, Not Features  
- SquareBoards isn't somewhere you visit — **it's somewhere you belong**

---

## Product philosophy

**Football owns Sundays. Baseball owns every day.**

MLB Squares is why players return every afternoon and evening during baseball season.

- Every day = fresh opportunity  
- Every game = exciting  
- Every inning = matters  

---

## How to play

Dedicated **"How To Play MLB Squares"** section — visible:

- Before joining a board  
- Inside Help / Rules  
- Anytime from the board screen  

### Core copy (keep this simple)

```
⚾ HOW MLB SQUARES WORK

1. Choose an open square on the board.
2. Once the board fills, random numbers (0–9) are assigned to each row and column.
3. Watch the game live.
4. Winning numbers = LAST digit of each team's score at four checkpoints:

   🏆 End of the 3rd Inning
   🏆 End of the 5th Inning
   🏆 End of the 7th Inning
   🏆 Final Score

Example: Yankees 5, Red Sox 2 → Winning square: 5–2

One game. Four opportunities to win.
No baseball knowledge required. Every Fan Has A Chance.
```

Use **illustrations and animations** — not long paragraphs. Onboarding should feel effortless.

---

## Board design

Classic **10×10** layout (100 squares). Premium SquareBoards visual language:

- Glass design · Dark theme · Purple accents · Rounded corners  
- Animated hover · Glowing winning squares  
- **Live ribbon:** current inning, score, upcoming checkpoint, board progress, player count, prize breakdown  

The board should feel **alive**.

---

## Winning structure

MLB uses **innings**, not quarters.

| Checkpoint | Prize tier |
|------------|------------|
| End of 3rd inning | 🥉 |
| End of 5th inning | 🥈 |
| End of 7th inning | 🥇 |
| Final score | 🏆 |

Winning square = **last digit** of each team's score at that checkpoint.

Each checkpoint awards its own prize.

### Scoring period model (implementation)

Extend platform scoring beyond football quarters:

```typescript
// Target periods for MLB Squares
type MlbScoringPeriod = "INN3" | "INN5" | "INN7" | "FINAL";
```

Wire through: `ScoringPeriod` / `lib/espn/sports.ts` · winner sync · payouts · live UI · legacy stats.

---

## Daily automation

Every morning (zero manual admin):

1. Import official MLB schedule  
2. Generate all available games + square boards  
3. Open entries · display countdowns  
4. Reveal numbers when boards lock  
5. Track live · calculate winners · process payouts  
6. Update Legacy · XP · Live Activity · Leaderboards · Player Timeline  

---

## Board generation — No Wait Line

When a board reaches **85% capacity**, automatically spawn Board #2, #3, #4… **unlimited**.

Players must **never** see "Board Full."

> *Current NFL engine locks/spawns at 100% — MLB should implement 85% threshold per this directive.*

---

## Game states

Support every MLB scenario automatically:

| State | Behavior |
|-------|----------|
| Normal game | Standard checkpoint flow |
| Extra innings | Affects **Final Score** checkpoint only |
| Rain delay | Pause board updates until play resumes |
| Suspended | Hold state per platform policy |
| Postponed (before first pitch) | Auto refund or transfer |
| Double header | Separate boards per game |
| Official scoring correction | Reconcile winners/payouts |

---

## Live game experience

During gameplay display:

- Current inning · Current score  
- Completed checkpoints · Upcoming checkpoint  
- Winning digits · Winning square preview  
- Remaining prize opportunities  

Players stay engaged from first pitch to final out.

---

## Player progression

Every completed MLB game feeds:

Legacy · XP · Tier credits · Achievements · Lifetime stats (MLB slice) · Reputation · Reward drops · Community activity · Timeline

See [Player Legacy Experience (#002)](./PLAYER_LEGACY_EXPERIENCE.md).

---

## Marketplace

Display MLB Squares **beside** NFL Squares with equal weight:

```
🏈 NFL Squares    ⚾ MLB Squares
🏈 NFL Pick'em    ⚾ MLB Pick'em
```

Both flagship experiences — not secondary.

---

## Onboarding

New users must instantly grasp:

**One board · One game · Four chances to win · Simple · Fun · Luck-based · No baseball expertise**

Short animations + visual examples only.

---

## Visual experience (checkpoint celebration)

When a checkpoint completes:

1. Board animates — winning row/column glow, square pulses  
2. Winner announcement + prize animation  
3. Legacy · Live Activity · Profile update  

Celebrate **every checkpoint** — not just final.

Prepare for **Highlight Squares™** extension points (grand slam, walk-off, etc.) without board redesign.

---

## Future-ready architecture

Board system must support without redesign:

- Highlight Squares™ · Special event squares · Seasonal/holiday boards · Community challenges  

Extension points: scoring engine · period config · celebration bus · stats adapter · `PlatformGameId`.

---

## Performance

- GPU-accelerated animations (`transform`, `opacity`)  
- Optimized live score polling / websocket updates  
- Lazy load assets · avoid unnecessary re-renders  
- Smooth on mid-tier mobile  

See [Project Polish (#003)](./PROJECT_POLISH.md).

---

## Success metrics

| Audience | Bar |
|----------|-----|
| First-time player | Understands game in **< 60 seconds** |
| Returning player | Engaged first pitch → final out |
| Experienced player | *Most polished baseball squares experience anywhere* |

---

## Final goal

Do not build another baseball game.

Build the **definitive MLB Squares experience**.

When players think of Baseball Squares, **SquareBoards is the standard**.

SquareBoards isn't building games — it's building **unforgettable sports experiences**.

---

## Implementation map *(codebase baseline — June 2026)*

| Capability | Status | Notes |
|------------|--------|-------|
| NFL Squares (10×10, quarters) | ✅ Live | `/games/nfl`, pool engine, Stripe checkout |
| MLB Pick'em | ✅ Live | `/baseball-pickem` — separate from squares |
| MLB Squares game mode | ❌ Not built | New flagship — do not bolt onto NFL-only types |
| ESPN MLB scoreboard | ⚠️ Partial | Stats hub has MLB; `EspnSport` lacks `mlb` today |
| Inning scoring periods | ❌ | `ScoringPeriod` is Q1–Q4 / 1H–2H only |
| 85% board spawn | ❌ | `boardEngine` spawns at 100% full |
| How-to-play MLB content | ❌ | Needs `/learn/how-to-play-mlb-squares` or sport-aware rules |
| Marketplace MLB tab | ❌ | Marketplace is NFL/NCAA/NBA/NCAA basketball |
| Checkpoint celebrations | ⚠️ Partial | NFL quarter wins; not inning-specific |
| Platform game registry | ❌ | Add `mlb-squares` to `lib/platform/gameTypes.ts` |

### Suggested build phases

1. **Foundation** — `mlb` in ESPN config, inning periods, MLB schedule import, board templates  
2. **Marketplace + purchase** — MLB browse, tiers, 85% spawn, lock at first pitch  
3. **Live + winners** — inning checkpoint sync, payouts, live board UI  
4. **Polish + ecosystem** — how-to-play, celebrations, legacy/XP/timeline hooks  
5. **Highlight Squares hooks** — moment detection extension points  

### Key files to extend

- `lib/espn/sports.ts` · `lib/types.ts` (periods + sport)  
- `lib/engines/boardEngine.ts` · `lib/engines/winnerSyncEngine.ts`  
- `lib/platform/gameTypes.ts` · `components/landing/MarketplaceSports.tsx`  
- `lib/platform/statsAdapter.ts` · `lib/database/services/playerLegacy.ts`  

---

## Related directives

- **#001** Platform ecosystem · **#002** Player legacy · **#003** Polish · **#004** *(reserved)*  

---

*Executive Product Directive #005 — Build the MLB Squares Experience*
