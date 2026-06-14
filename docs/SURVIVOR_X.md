# Executive Product Directive #007 — Build Survivor X™

**Status:** Active product direction  
**Effective:** June 2026  
**Parent:** [Project Legacy (#001)](./PROJECT_LEGACY.md)

---

## Objective

Build the **world's most engaging NFL Survivor experience**.

Do not recreate traditional Survivor Pools. **Reinvent them.**

Survivor X™ is a premium, season-long experience combining strategy, community, progression, and rewards into one unforgettable journey.

**Third flagship experience** inside the SquareBoards Platform.

---

## Product philosophy

Traditional Survivor asks: *"Who will win this week?"*

SquareBoards asks: *"Can you survive the entire season while building your legacy?"*

Players chase:

- Legacy · Achievements · Perfect Seasons  
- Community Reputation · Exclusive Rewards  
- Hall of Fame Status · Season Championships  

---

## How to play

Interactive tutorial — **teach through animation**, not walls of text.

1. Choose **ONE** NFL team each week.  
2. If your team wins → **You survive.**  
3. If your team loses → **You are eliminated.**  
4. You may **NEVER** choose the same team twice in a season.  
5. Continue until one player remains.

---

## Game modes

| Mode | Description |
|------|-------------|
| 🏆 Classic Survivor | One loss eliminates you |
| 🔥 Double Life | Two lives — lose twice, out |
| ⚡ Turbo Survivor | Shorter seasonal tournaments |
| 🌎 Global Survivor | Entire SquareBoards community |
| 👥 Private Survivor | Friends/family — invite code, custom fees/prizes |

---

## Weekly experience

- **Tuesday:** New week opens, countdown, reminders, Huddle discussion  
- **Pre-kickoff:** Confidence meter, pick trends, lock selection  
- **Weekend:** Live survival tracker through all games  
- **Monday Night:** Final survivors determined  

---

## Live Survival Map (LiveCore)

During games:

- Players Remaining · Eliminated Today · Perfect Players Remaining  
- Most Popular Pick · Biggest Upset Risk · Current Survivor Rate  
- Live elimination animation  

---

## Community (Huddle)

After kickoff only:

- Share picks · Celebrate survival · Follow elite players  
- Survivor rankings · Weekly strategy discussion  
- Positive, family-friendly — no live chat required  

---

## Legacy & rewards

Contributes to: XP, tier credits, achievements, reward drops, profile frames, seasonal collectibles, champion banners.

Career stats: wins, longest streak, perfect seasons, elite badges, Hall of Fame, lifetime timeline.

---

## Eliminated players

Never leave them idle:

- Follow friends · Live standings · Prediction XP side challenges  
- Reward drops · Squares · Pick'em · Community events  

---

## Private leagues

Creators control: entry fee, max players, name, image, invite code, prize structure, custom rules. Automatic payouts via SquareBoards.

---

## Survivor Hall of Fame

Permanent display: perfect seasons, longest streak, championships, seasons played, fastest champion, community favorites.

---

## Premium presentation

Dramatic eliminations — card fade, leaderboard rise, live updates, confetti for champions, season-ending ceremony.

---

## Platform integration

Publish/subscribe via **EventEngine™**:

- `survivor.pick_locked` · `survivor.survived` · `survivor.eliminated`  
- `survivor.week_complete` · `survivor.champion_crowned`  

Subscribers: LegacyCore, RewardCore, CommunityCore, LiveCore, NotificationCenter, Analytics.

---

## Future-ready sports

Architecture supports: NBA, MLB, Soccer, NHL, College Football, March Madness Survivor without redesign.

---

## Implementation phases

| Phase | Scope |
|-------|--------|
| **1** (current) | Schema, landing hub, animated tutorial, HOF shell, platform registry |
| **2** | Global Classic league, weekly pick flow, elimination engine |
| **3** | Live Survival Map, EventEngine wiring, rewards/XP |
| **4** | Private leagues, Double Life, Turbo, Huddle integration |
| **5** | Premium animations, ceremony, multi-sport expansion |

---

## Principles

- Every Fan Has A Chance  
- There Is No Wait Line  
- Build Moments, Not Features  
- Never Leave the Player Standing Still  
- SquareBoards Isn't Somewhere You Visit — **It's Somewhere You Belong**

SquareBoards does not recreate Survivor. **SquareBoards redefines it.**
