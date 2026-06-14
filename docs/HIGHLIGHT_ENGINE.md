# Executive Product Directive #006 — Universal Highlight Engine™

**Status:** Active product direction  
**Effective:** June 2026  
**Parent:** [Project Legacy (#001)](./PROJECT_LEGACY.md)

---

## Objective

Build the **Universal Highlight Engine™**.

This is **not** NFL- or MLB-exclusive. It is a **platform-wide engagement engine** powering every Squares experience.

The Highlight Engine celebrates **unforgettable sports moments** — rewarding **excitement**, not scores.

Players stay emotionally invested from first whistle to final horn, even when no longer competing for cash prizes.

This should become one of the **defining innovations** of SquareBoards.

---

## Platform philosophy

| Traditional Squares | SquareBoards |
|---------------------|--------------|
| Rewards scores only | **Rewards moments** |

Every unforgettable moment deserves to feel special. When something incredible happens live, the platform **celebrates it**.

Player mindset:

> *"I may not have won the inning… but my Highlight Square could still activate."*

That anticipation keeps players engaged until the **final whistle, final out, final buzzer, or final horn**.

---

## Highlight Squares™

Every Squares board contains:

- **Standard squares** (cash checkpoint prizes)
- **Highlight Squares™** (moment-based platform rewards)

### Assignment rules

- Randomly assigned **after** board numbers are revealed  
- **Not purchasable** — equal opportunity for all players on the board  
- **4–8 Highlight Squares** per board (suggested)  
- Selected from **occupied squares only**  
- Selection: **completely random**, auditable, transparent  

---

## Visual design

Highlight Squares must stand out instantly — without breaking the board:

| Treatment | Effect |
|-----------|--------|
| ⭐ | Animated gold border |
| ✨ | Soft glow |
| 💜 | Purple pulse |
| ⚡ | Particle effects |
| 🎆 | Subtle shimmer |

---

## Discovery experience

**Do not** fully explain Highlight Squares upfront.

First encounter — tooltip only:

> ⭐ **Highlight Square**  
> *"Special moments can unlock exclusive rewards."*

Mystery drives curiosity. Players explore naturally.

---

## Reward philosophy

Highlight Squares **NEVER** affect cash prizes.

Cash = official scoring checkpoints only.

Highlight rewards = **participation celebration** (configurable):

- XP · Tier credits · Weekly reward tokens · Weekly mystery box  
- Free square credit · Marketplace credit · Profile badge · Profile frame  
- Seasonal collectible · Achievement · Community reputation  
- Referral boost token · Double XP boost  

All reward types must be **admin-configurable** per event tier.

---

## Universal event registry

One reusable engine. Each sport **registers events** — no engine forks.

### NFL

Hail Mary TD · Kick return TD · Punt return TD · Pick six · Safety · Blocked kick TD · Overtime winning score

### MLB

Grand slam · Walk-off HR · Triple play · Inside-the-park HR · No-hitter completed · Cycle completed · First-pitch HR

### NBA

Buzzer beater · Poster dunk · Triple double · Four-point play · Half-court shot

### Soccer

Hat trick · Bicycle kick goal · Goalkeeper goal · Penalty shootout winner · Last-minute goal

### NHL

Hat trick · Overtime goal · Empty-net goal · Goalie assist · Shutout

**Future sports:** register events only — **no engine modifications**.

### Registry contract (implementation)

```typescript
interface HighlightEventDefinition {
  id: string;                    // e.g. "mlb.grand_slam"
  sport: EspnSport | string;
  label: string;
  description: string;
  detection: "play_feed" | "score_delta" | "manual_admin";
  rewardProfileId: string;
  priority: number;
  enabled: boolean;
}
```

Central registry: `lib/highlight/registry.ts`  
Detection adapters per sport: `lib/highlight/detectors/`  
Moment ingestion: ESPN play-by-play / summary webhooks / cron sync  
**Publish:** `highlight.activated` via [EventEngine™](./EVENT_ENGINE.md)  

---

## Live board reactions (automatic pipeline)

When a Highlight Event fires:

1. Board subtly darkens  
2. Highlight Squares glow  
3. Winning Highlight Square pulses  
4. Reward animation plays  
5. Reward appears on screen  
6. XP updates  
7. Player Timeline updates  
8. Legacy updates  
9. Live Activity updates  
10. Community Feed (Huddle) updates  

**No manual steps.** Event bus → board UI → rewards → ecosystem hooks.

---

## Player experience (canonical scenario)

Bottom of the 9th. Player lost all four inning checkpoints.

**Grand slam.**

⭐ **Highlight Square Activated!** — reward earned. Player celebrates anyway.

**Nobody mentally leaves the game early.**

---

## Living Boards™

Boards are no longer static — they **react, celebrate, evolve**.

Future theming (architecture-ready):

- Holiday · Playoff · Championship themes  
- Fireworks · Dynamic weather · Seasonal effects · Community events  

The board itself is **entertainment**.

---

## Fairness

Highlight Squares must be:

- Completely random  
- Auditable (immutable assignment log)  
- Transparent (players can see assignment after number reveal)  
- Impossible to manipulate  

**Trust is the highest priority.**

Store: `board_id`, `square_index`, `assignment_seed`, `assigned_at`, `event_id` that triggered reward.

---

## Performance

- GPU-accelerated animations (`transform`, `opacity`)  
- No unnecessary re-renders during live scoring  
- Smooth on mobile · do not block score sync  

See [Project Polish (#003)](./PROJECT_POLISH.md).

---

## Future expansion (plug-in, no redesign)

- Legendary / Diamond Highlight Squares  
- Golden Highlight Events  
- Community / Sponsored / Tournament highlights  

See also: [EventEngine™](./EVENT_ENGINE.md) — sport events publish here; Highlight Engine subscribes.

Extension points: registry tiers · reward profiles · board theme layer · celebration presets · **EventEngine.publish()**.

---

## Final objective

Do not build another reward system.

Build an **emotional engagement engine**.

Players remember not only winning quarters — but **moments that brought every board to life**.

### Company principles

- Every Fan Has A Chance  
- Build Moments, Not Features  
- Never Leave the Player Standing Still  
- SquareBoards isn't somewhere you visit — **it's somewhere you belong**

---

## Implementation map *(codebase baseline — June 2026)*

| Capability | Status | Notes |
|------------|--------|-------|
| Highlight Squares on board | ❌ | Not built |
| Universal event registry | ❌ | Not built |
| Post-reveal random assignment | ❌ | Not built |
| Moment detection (ESPN) | ❌ | Score sync exists; play-level events not wired |
| Highlight board UI/animations | ❌ | |
| Configurable highlight rewards | ⚠️ Partial | XP/rewards ecosystem exists separately |
| Profile win highlights | ✅ | `lib/huddle/winHighlights.ts` — **cash win history, not Highlight Engine** |
| Live Activity feed | ✅ | Extend with `highlight_activated` event type |
| Player timeline | ❌ | Per #002 |
| Sound: highlight activate | ❌ | Prepared in #003 sound architecture |

### Suggested build phases

1. **Core engine** — registry, assignment at number reveal, DB schema, audit log  
2. **Board UX** — visual treatment, tooltip, celebration overlay  
3. **Detection v1** — 2–3 events per sport (NFL + MLB first), ESPN play feed  
4. **Reward dispatch** — XP, credits, badges via existing rewards pipeline  
5. **Ecosystem hooks** — timeline, legacy, Huddle, live activity  
6. **Living Boards themes** — seasonal/playoff layers  

### Key integration points

- Board lock / number draw: `lib/database/services/boards.ts`  
- Live sync: `lib/espn/sync.ts`, `lib/engines/winnerSyncEngine.ts`  
- Rewards: `lib/platform/ecosystem/`  
- Live activity: `lib/liveActivity/`  
- Stats/legacy: `lib/platform/statsAdapter.ts`  

### Distinction

| System | Purpose |
|--------|---------|
| `winHighlights` (Huddle) | Past **cash/quarter** wins for social profile |
| **Highlight Engine™** | Live **moment** rewards on assigned Highlight Squares |

Do not conflate the two.

---

## Related directives

- **#001** Project Legacy (Highlight Squares overview)  
- **#002** Player Legacy (timeline, reputation)  
- **#003** Project Polish (motion, sound, celebrations)  
- **#005** MLB Squares (innings + highlight hooks)  

---

*Executive Product Directive #006 — Universal Highlight Engine™*
