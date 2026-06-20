# SquareBoards Social Growth Engine

Production-ready **Social Growth Engine** that turns every shared SquareBoards link into premium, branded marketing across iMessage, SMS, Discord, Slack, Facebook, Instagram DMs, WhatsApp, X, LinkedIn, Reddit, and Google Search.

## Architecture

| Layer | Location | Purpose |
|-------|----------|---------|
| Global metadata | `lib/seo/site.ts`, `app/layout.tsx` | `metadataBase`, OG, Twitter, robots, icons |
| Share URL builders | `lib/seo/shareUrls.ts` | Type-safe URLs for native share sheets |
| Public API | `lib/seo/socialGrowth.ts` | App-facing exports for Capacitor / web share |
| OG design system | `lib/seo/og/design.ts`, `layout.tsx` | Dark purple AAA gaming aesthetic |
| Card renderers | `lib/seo/og/cards.tsx` | `ImageResponse` JSX for every card type |
| Data fetchers | `lib/seo/og/data.ts` | Server-side player/contest/leaderboard data |
| Share pages | `lib/seo/og/sharePages.tsx` | Metadata + landing UI for `/share/*` routes |
| OG response helper | `lib/seo/og/response.ts` | Cached fonts, 1200×630, `revalidate: 3600` |
| Crawler detection | `lib/seo/crawlers.ts` | iMessage / social bot user-agent patterns |

## Share Card Types

| Card | Share URL | OG Route |
|------|-----------|----------|
| Homepage | `/` | `app/opengraph-image.tsx` |
| Player profile | `/profile/{username}` | `app/profile/[username]/opengraph-image.tsx` |
| Contest | `/share/contest/{id}` | `app/share/contest/[id]/opengraph-image.tsx` |
| Winner | `/share/winner/{username}/{winId}` | `app/share/winner/[username]/[winId]/opengraph-image.tsx` |
| Level up | `/share/level-up/{username}/{tierSlug}` | `app/share/level-up/[username]/[tierSlug]/opengraph-image.tsx` |
| Achievement | `/share/achievement/{username}/{achievementId}` | `app/share/achievement/.../opengraph-image.tsx` |
| Trophy | `/share/trophy/{username}/{trophyId}` | `app/share/trophy/.../opengraph-image.tsx` |
| Referral | `/share/referral/{code}` | `app/share/referral/[code]/opengraph-image.tsx` |
| Leaderboard | `/share/leaderboard/{weekly\|monthly\|all-time}` | `app/share/leaderboard/[period]/opengraph-image.tsx` |
| Player story | `/share/story/{username}/{storyId}` | `app/share/story/.../opengraph-image.tsx` |
| Season recap | `/share/season/{username}/{seasonKey}` | `app/share/season/.../opengraph-image.tsx` |

## Usage in App Code

```ts
import { shareUrls } from "@/lib/seo/socialGrowth";

// Winner share after contest victory
const url = shareUrls.winner(playerSlug, winHighlightId);

// Referral invite
const inviteUrl = shareUrls.referral(referralCode);

// Achievement unlock
const achievementUrl = shareUrls.achievement(slug, achievement.id);
```

Use with `@capacitor/share` or Web Share API — crawlers automatically fetch the colocated `opengraph-image.tsx`.

## Static Homepage OG Asset

```bash
npm run og:generate
```

Writes `public/og-image.png` (1200×630). Also runs automatically before `npm run build`.

Dynamic homepage OG is additionally served via `app/opengraph-image.tsx`.

## SEO

- **`app/robots.ts`** — allows all crawlers, points to sitemap
- **`app/sitemap.ts`** — home, FAQ, transparency, responsible gaming, terms, privacy, leaderboards, public profiles

## Performance

- All metadata is **server-rendered** (no client `Head`)
- OG images use **`revalidate: 3600`** (1 hour ISR cache)
- Fonts fetched once and cached via `next.revalidate`
- Standard **1200×630** dimensions for all cards

## Files Created / Modified

### Created
- `lib/seo/og/` — types, design, fonts, layout, cards, data, metadata, response, sharePages
- `lib/seo/shareUrls.ts`, `lib/seo/socialGrowth.ts`
- `app/opengraph-image.tsx`
- `app/share/**` — 9 share types × (page + opengraph-image)
- `components/share/ShareLanding.tsx`
- `scripts/generate-og-image.mjs`
- `public/og-image.png`
- `docs/SOCIAL_GROWTH_ENGINE.md`

### Modified
- `lib/seo/site.ts` — tagline, 1200×630, robots, keywords
- `lib/seo/profileOgData.ts` — delegates to unified data layer
- `app/profile/[username]/opengraph-image.tsx` — uses shared card system
- `app/sitemap.ts` — expanded static routes
- `package.json` — `og:generate`, build hook

## Environment

- `SITE_URL` — canonical origin (default `https://www.squareboards.pro`)
- `FACEBOOK_APP_ID` / `NEXT_PUBLIC_FACEBOOK_APP_ID` — optional `fb:app_id`

## Design Language

Every generated image uses:
- Dark background `#030712`
- Purple gradients `#5B4CF7` → `#7B61FF`
- Plus Jakarta Sans typography
- Rounded premium cards, soft glows, gold accents
- Footer: **SquareBoards™ — Compete. Build Your Legacy.**
