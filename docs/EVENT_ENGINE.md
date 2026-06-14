# Executive Architecture Directive #002 — Build the EventEngine™

**Status:** Active architecture direction  
**Effective:** June 2026  
**Parent:** [Project Legacy — Product #001](./PROJECT_LEGACY.md)

---

## Objective

Build **EventEngine™** — the central event processing system powering the entire SquareBoards platform.

EventEngine is **not a feature**. It is the **heartbeat** of SquareBoards.

- Every meaningful action → **Event**  
- Every Event → automatically notifies every system that must react  

Eliminate duplicate business logic. Enable unlimited sports, experiences, rewards, and future products.

**The central nervous system of SquareBoards.**

---

## Platform philosophy

Do not think about sports. Do not think about boards.

**Think about EVENTS.**

Everything that happens inside SquareBoards is an event:

Player purchased a square · Board filled · Numbers revealed · Game started · 3rd inning completed · Quarter ended · Player won · Highlight activated · Reward unlocked · Achievement earned · Tier promoted · Referral completed · Mystery box opened · Follower gained · Pick'em submitted · Game postponed · Rain delay · Payout completed · Legacy updated · …

**Everything is an Event.**

---

## Event flow

Every event follows the same lifecycle:

```
Grand Slam (sport moment)
    ↓
EventEngine™
    ↓
Determine event type
    ↓
Notify interested systems
    ↓
HighlightEngine™ · RewardCore™ · LegacyCore™ · CommunityCore™
LiveCore™ · NotificationCenter™ · Analytics™
    ↓
Complete
```

**One event. Multiple systems. No duplicate logic.**

---

## Event types (catalog)

### Player events

Player registered · logged in/out · username changed · referral used · followed/unfollowed · profile updated · avatar changed · tier promoted

### Game events

Board created · board filled · numbers assigned · game started · checkpoint completed · game finished · extra innings · suspended · rain delay · resumed · cancelled · payout completed

### Sport events *(dynamic registry)*

Touchdown · field goal · grand slam · walk-off · triple play · hat trick · buzzer beater · safety · pick six · overtime goal · …

Future sports **register events** — engine stays sport-agnostic.

### Reward events

Reward earned/opened · weekly drop claimed · tier credits awarded · marketplace purchase · bonus square granted · reward expired/redeemed

### Community events

Follower added · pick shared/copied · profile viewed · achievement/milestone shared · Hall of Fame entry

### Legacy events

Career milestone · 100/500 wins · perfect Pick'em week · longest streak updated · Hall of Fame promotion · record broken

### System events

Push/email/SMS · live activity update · leaderboard refresh · database audit · security log · analytics event

---

## Event bus

Publish **once**. Subscribers decide whether to respond.

```
Player Won Quarter
    ↓
EventEngine.publish()
    ↓
RewardCore · LegacyCore · LiveCore · CommunityCore
Analytics · NotificationCenter
    ↓
Done
```

**No feature directly calls another feature.** All communication through EventEngine™.

---

## Subscription model

Each engine subscribes only to required events.

| Engine | Example subscriptions |
|--------|----------------------|
| **RewardCore™** | PlayerWon, HighlightActivated, ReferralCompleted, AchievementEarned, TierPromotion |
| **LegacyCore™** | PlayerWon, RewardClaimed, GameCompleted, HighlightActivated, ReferralCompleted |
| **LiveCore™** | GameStarted, CheckpointCompleted, PlayerWon, HighlightActivated, LeaderboardChanged |
| **CommunityCore™** | PickShared, FollowerAdded, AchievementShared, MilestoneReached |
| **NotificationCenter™** | All player-facing communication events |
| **Analytics™** | All events (optional sampling) |

See also: [Highlight Engine (#006)](./HIGHLIGHT_ENGINE.md) — consumes sport events, publishes `HighlightActivated`.

---

## Future sports

EventEngine remains **completely sport-agnostic**.

NFL → MLB → NBA → Soccer → NHL → future sports

All generate events. The engine knows **event definitions**, not sport rules.

---

## Event priorities

| Priority | Examples |
|----------|----------|
| **Critical** | Payment processed, security alert, game result |
| **High** | Player win, highlight activated, reward earned |
| **Normal** | Follower added, profile updated |
| **Background** | Analytics, statistics, logging |

Critical/high: synchronous or fast queue. Background: async workers.

---

## Reliability

Events must **never be lost**:

- Retries · queueing · failure logging · dead-letter queue  
- Audit trail · duplicate protection · **idempotency**  
- Event timestamps · unique event IDs  

Enterprise-level reliability.

---

## Analytics

Every event optionally generates analytics — no extra feature code:

- Popular boards · session length · reward engagement  
- Highlight activation rate · referral conversion · board fill speed  
- Retention · DAU  

**Analytics subscribes to EventEngine™.**

---

## Performance

- Async processing where appropriate  
- Non-blocking UI  
- No duplicate processing  
- Thousands of concurrent users · horizontal scaling  

---

## Developer experience

Adding a feature:

```
New Event → Register Event → Publish Event → Subscribe Systems → Done
```

No editing ten different services.

---

## Design principle — independent engines

| Engine | Role |
|--------|------|
| SquareCore™ | Boards, games, checkpoints |
| HighlightEngine™ | Moment detection & highlight squares |
| RewardCore™ | XP, drops, credits, mystery boxes |
| LegacyCore™ | Career stats, milestones, timeline |
| CommunityCore™ | Huddle, follows, social |
| MarketplaceCore™ | Browse, purchase, tiers |
| LiveCore™ | Live activity, leaderboards pulse |
| NotificationCenter™ | Push, email, SMS |
| Analytics™ | Metrics, retention |

**Everything communicates through EventEngine™.** No tight coupling between engines.

---

## Proposed implementation layout

```
lib/events/
  types.ts           # EventType enum + payload interfaces
  engine.ts          # publish(), subscribe(), idempotency
  registry.ts        # Dynamic sport event registration
  queue.ts           # Async dispatch (Vercel queue / Supabase / Redis)
  audit.ts           # Persist every event (extends platform_audit_log)
  handlers/
    rewardCore.ts
    legacyCore.ts
    liveCore.ts
    communityCore.ts
    notifications.ts
    analytics.ts
    highlightEngine.ts
```

### Event envelope

```typescript
interface PlatformEvent<T extends string = string> {
  id: string;              // UUID — idempotency key
  type: T;
  priority: "critical" | "high" | "normal" | "background";
  occurredAt: string;        // ISO timestamp
  actorEmail?: string | null;
  entityType?: string;
  entityId?: string;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
```

### Publish API

```typescript
await EventEngine.publish({
  type: "game.checkpoint_completed",
  priority: "high",
  entityType: "board",
  entityId: boardId,
  payload: { period: "INN3", homeScore: 5, awayScore: 2, winnerEmail },
});
```

---

## Company philosophy

- Build systems that last · platforms that scale · experiences that delight  
- Never duplicate business logic · never create unnecessary dependencies  
- Always build for the next decade  

---

## Final objective

EventEngine™ is the **invisible foundation** powering every interaction.

- Players never know it exists  
- Developers depend on it every day  
- Every future sport, game, reward, and feature **plugs in** — no isolated implementations  

SquareBoards is not a collection of features. It is a **connected ecosystem of intelligent systems**.

Build EventEngine™ as if it will power SquareBoards for **the next ten years**.

---

## Implementation map *(codebase baseline — June 2026)*

| Capability | Status | Notes |
|------------|--------|-------|
| Central EventEngine / pub-sub | ✅ Phase 1 | `lib/events/` — publish, subscribe, persist |
| `platform_events` table | ✅ Migration 042 | Run in Supabase before production |
| `platform_audit_log` | ✅ Via legacy handler | All `logPlatformAudit` routes through EventEngine |
| Security events | ⚠️ Isolated | `notifySecurityEvent` — separate from platform events |
| Announcement analytics events | ⚠️ Isolated | Own event table |
| Stripe webhooks | ⚠️ Direct handlers | Should publish to EventEngine |
| Winner sync / payouts | ⚠️ Direct calls | Should publish `game.checkpoint_completed`, `payout.completed` |
| Highlight Engine | ❌ | Spec #006 — should consume/publish via EventEngine |

### Migration strategy

1. ~~**Define event catalog**~~ ✅ `lib/events/types.ts`  
2. ~~**Implement publish + in-process subscribers**~~ ✅ `lib/events/engine.ts`  
3. ~~**Persist all events**~~ ✅ `platform_events` (migration `042_platform_events.sql`)  
4. **Refactor hot paths** — winner sync + payouts wired; checkout/highlight next  
5. **Add async queue** — background priority, retries, DLQ  
6. **Wire Analytics + NotificationCenter** as full subscribers  

### Related directives

| Doc | Relationship |
|-----|--------------|
| [Highlight Engine #006](./HIGHLIGHT_ENGINE.md) | Publishes `highlight.activated`; subscribes to sport events |
| [Player Legacy #002](./PLAYER_LEGACY_EXPERIENCE.md) | LegacyCore subscriber |
| [MLB Squares #005](./MLB_SQUARES_EXPERIENCE.md) | Publishes inning checkpoint events |
| [Project Polish #003](./PROJECT_POLISH.md) | Live UI reacts via LiveCore subscriber |

---

*Executive Architecture Directive #002 — EventEngine™*
