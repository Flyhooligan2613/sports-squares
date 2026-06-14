# Executive Product Directive #002 — The Player Legacy Experience

**Status:** Active product direction  
**Effective:** June 2026  
**Parent:** [Project Legacy (#001)](./PROJECT_LEGACY.md)

---

## Objective

Transform the Player Profile into the **heart of the SquareBoards ecosystem**.

The profile is no longer a simple account page. It is every player's **digital identity** — something players feel proud to share, improve, and return to. Reputation should grow over months and years of participation.

---

## Design philosophy

When a player opens their profile they should immediately feel: **"I've built something."**

Premium gaming profile — not a sportsbook account.

**Reference profiles:** Xbox Gamer Profile · PlayStation Profile · Steam Profile · Discord Profile — with a unique SquareBoards identity.

---

## Player header

### Display

- Emoji avatar · Username · Player ID
- Tier badge · Join date · Current rank
- Win percentage · Current win streak · Longest win streak
- Followers · Following
- Lifetime winnings · Total games played
- **Share Profile** button

### Customization

- Bio · Favorite team · Favorite sport · Favorite experience
- Banner theme · Accent color *(future)*

---

## Tier progression

Permanent player tiers:

**Bronze → Silver → Gold → Platinum → Diamond → Champion → Elite → Legend → Immortal**

Each tier unlocks:

- Profile frames · Exclusive badge · Special reward drops
- Unique animations · Community recognition · Marketplace discounts
- Highlight Square multipliers *(future)*

Tier progression must feel **meaningful**.

---

## Legacy dashboard

Dedicated **Legacy** section showing permanent history:

| Stat | Stat |
|------|------|
| Career wins | Career earnings |
| Quarter wins | Pick'em wins |
| Perfect weeks | Referral count |
| Achievements | Highlight Square rewards |
| Reward drops opened | XP earned |
| Community reputation | |

---

## Trophy case

Visual trophy cabinet:

- Badges · Championships · Milestone awards
- Special events · Seasonal rewards · Referral awards
- Hall of Fame honors

**Rare collectibles remain permanently visible.**

---

## Player reputation

**Community Reputation Score** — earned through:

- Completed games · Shared picks · Followers · Referrals
- Achievements · Sportsmanship · Helpful community participation

**Not** chat-based scoring. **Not** popularity contests. Reward positive engagement.

---

## Timeline

Personal activity timeline (scrollable history):

- Won Quarter 2 · Reached Gold Tier · Unlocked Weekly Reward Drop
- Received 100 Followers · Published Pick Card · Perfect Pick'em Week
- Earned Hall of Fame Badge · *(etc.)*

---

## Lifetime statistics

Organized **by sport:** NFL · NBA · MLB · Soccer · Overall

Per sport:

- Games played · Wins · Accuracy · Average finish
- Quarter wins · Best season · Longest streak
- Favorite teams · Favorite experiences

---

## Future-ready architecture

Every future experience must automatically contribute to:

- Legacy · Achievements · Statistics · Reputation · Progression

**No future redesign should be required** when new games launch.

### Implementation contract

New game modes must expose stats via the platform stats adapter (`lib/platform/statsAdapter.ts`) and register in `lib/platform/gameTypes.ts` so profile, legacy, and reputation update without profile UI rewrites.

---

## User experience

The Player Profile should be one of the **most frequently visited** areas of the platform.

Players return not only for winnings — but to admire how far they've progressed.

The profile communicates: **identity · reputation · accomplishment · belonging.**

This is where players build their SquareBoards legacy.

---

## Goal

After several months of gameplay, a player should immediately recognize they have **built something meaningful**.

SquareBoards does not simply track activity — it **celebrates the player's journey**.

The Player Profile is the **permanent home** of that journey.

---

## Current codebase baseline *(June 2026)*

| Directive area | Today |
|----------------|-------|
| Share profile | ✅ Public slug + share on `MyProfileClient` |
| Avatar / bio / username | ✅ Settings sections |
| Legacy stats | ⚠️ Partial — `PlayerLegacyStats` (winnings, wins, streaks, boards) |
| Achievements | ⚠️ Basic unlock list |
| Social (followers) | ✅ `ProfileSocialView` |
| Tier progression | ❌ Not built |
| Legacy dashboard | ❌ Not built as dedicated section |
| Trophy case | ❌ Not built |
| Reputation score | ❌ Not built |
| Activity timeline | ❌ Not built |
| Sport-split stats | ❌ Not built |
| Banner theme / favorites | ❌ Not built |

**Primary files:** `components/player/MyProfileClient.tsx`, `PlayerLegacyProfile.tsx`, `lib/player/legacyTypes.ts`, `lib/database/services/playerLegacy.ts`

---

*Executive Product Directive #002 — The Player Legacy Experience*
