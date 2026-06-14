# Executive Product Directive #003 — Project Polish

**Status:** Active product direction  
**Effective:** June 2026  
**Parent:** [Project Legacy (#001)](./PROJECT_LEGACY.md)

---

## Objective

Core functionality is largely established. Focus shifts from **adding features** to creating a **premium, unforgettable user experience**.

- Every interaction intentional  
- Every animation smooth  
- Every page alive  

The platform should feel comparable to **Apple, Xbox, PlayStation, Stripe, Arc Browser, and Linear**.

Players should immediately recognize SquareBoards as a **polished, high-quality platform**.

---

## First impression

The **first five seconds** matter most.

Home page must communicate:

| Signal | Meaning |
|--------|---------|
| **Trust** | Secure, professional, Stripe-backed |
| **Excitement** | Live games, real action |
| **Community** | Players, Huddle, leaderboards |
| **Activity** | Happening now, winners, pulse |
| **Premium quality** | Motion, typography, glow, cohesion |

User should feel they entered a **living sports gaming platform** — not a static website.

---

## Motion design

Improve animations across the application.

**Surfaces:** Navigation · Cards · Buttons · Menus · Tabs · Drawers · Loading states · Progress bars · Reward drops · Player cards · Leaderboard updates · Activity feed · Profile elements

**Rules:**

- Subtle, fluid, **GPU-accelerated** (`transform`, `opacity`)  
- Nothing snaps into place abruptly  
- Honor `prefers-reduced-motion`  

---

## Consistency audit

Standardize on every screen:

- Spacing · Corner radius · Padding · Typography  
- Card shadows · Glow effects · Button heights · Icon sizes  
- Animation timing · Loading indicators  

Every page belongs to **one design system**.

Reference tokens: `app/globals.css`, shared UI components (`Button`, `LandingGlassCard`, nav drawer).

---

## Empty states

Every screen without data must feel **intentional** — not broken.

| Empty | Direction |
|-------|-----------|
| No games | Browse marketplace CTA |
| No rewards | Explain Square Drop + next unlock |
| No followers | Share profile, join Huddle |
| No activity | Suggest first game or pick |
| No pick cards | Play This Week CTA |

Use encouraging copy + illustration + **actionable next step**. Guide toward the next experience.

---

## Micro-interactions

Premium touches that delight without distracting:

- Soft button press · Card lift on hover  
- Subtle haptic feedback (mobile, where supported)  
- Animated XP gains · Tier promotion celebrations  
- Smooth tab transitions · Profile stat counters · Reward reveal effects  

---

## Sound architecture *(prepare, do not ship loud)*

Optional sound effects — **player-controlled, never auto-play**:

| Event | Sound moment |
|-------|----------------|
| Reward Drop opens | Soft reveal |
| Highlight Square activates | Energy pulse |
| Achievement unlocked | Chime |
| Referral earned | Positive ping |
| Quarter won | Celebration tone |
| Tier promotion | Rank-up fanfare |

Architecture: global sound preference (off by default), event bus, lazy-loaded audio assets.

---

## Celebration moments

Major accomplishments deserve tasteful celebration:

- First win · 100th win · Tier promotion  
- Perfect Pick'em week · Referral milestone  
- Hall of Fame induction · Diamond Reward Drop  

Use: animations, confetti, glow, overlays — **avoid excessive visual noise**.

---

## Loading experience

Replace generic spinners with **branded loading**:

- *Preparing today's games…*  
- *Calculating winners…*  
- *Opening your Reward Drop…*  
- *Loading your legacy…*  
- *Checking live scores…*  

Reinforces SquareBoards identity during wait states. Prefer **skeleton placeholders** over spinners where layout is known.

---

## Accessibility

Built into every experience:

- Color contrast · Font sizes · Touch targets (min 44px)  
- Keyboard navigation · Reduced motion  
- Screen reader labels on interactive elements  

---

## Performance

Optimize for lower-end devices:

- Image loading · Lazy loading · Animation performance  
- Bundle size · Render performance · API latency  
- Skeleton placeholders · Avoid layout shift  

Application must feel **responsive** on mid-tier phones.

---

## Premium standard (v1.0 gate)

Before Version 1.0 is complete, every screen must answer:

> **Would this experience make a player proud to recommend SquareBoards to a friend?**

If not — continue refining.

---

## Final goal

SquareBoards should no longer feel like a startup application.

It should feel like a **polished consumer platform** players trust, enjoy, and return to every game day.

Every detail reinforces:

- **Every Fan Has A Chance**  
- **There's No Wait Line**  
- **SquareBoards isn't somewhere you visit — it's somewhere you belong**

---

## Current codebase baseline *(June 2026)*

| Area | Today |
|------|-------|
| Landing motion | ✅ `ScrollReveal`, hero parallax, `sb-btn-spring`, micro-animations CSS |
| Stat counters | ✅ `useCountUp` on profile |
| Skeletons | ⚠️ Partial — marketplace, some player views |
| Reduced motion | ⚠️ Partial — hero parallax only |
| Empty states | ⚠️ Inconsistent across dashboard/rewards/social |
| Branded loading copy | ❌ Generic spinners in places |
| Celebration overlays | ⚠️ Some board events; not unified system |
| Sound architecture | ❌ Not built |
| Design token audit | ❌ Not formalized |

**Priority polish surfaces:** Home first 5s · Nav drawer · My Games dashboard · Winnings · Reward Drop · Profile · Board purchase flow

---

## Related directives

- **#001 — Project Legacy:** Platform ecosystem direction  
- **#002 — Player Legacy Experience:** Profile as digital identity  

---

*Executive Product Directive #003 — Project Polish*
