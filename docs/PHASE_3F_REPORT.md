# Phase 3F — Notifications & Activity Center

**Project:** PROJECT BLACK LABEL  
**Scope:** Premium notification hub, activity timeline, notification settings, empty states, micro-interactions  
**Frozen areas:** Homepage, wallet UI, onboarding, rewards, contests, profiles — **not modified**

---

## Summary

Phase 3F extends the existing notification infrastructure into a three-tab hub (Notifications · Activity · Settings) with category filters, search, mark-read/archive/delete actions, a personal activity timeline backed by real platform data, and device-local category preferences wired to push subscription state from migration `040_player_push_notifications`.

---

## Notification Center (`NotificationCenter`, `/my-games/notifications`)

| Feature | Implementation |
|---------|----------------|
| Item layout | Icon, title, description, timestamp, status, related CTA — **real** |
| Mark read / all read | `readState.ts` localStorage — **real** |
| Archive / delete | Extended `readState.ts` — **real (client-side)** |
| Category filter | 9 tabs: All + 8 categories via `notificationMeta.ts` — **real** |
| Search | Title, detail, category match — **real** |
| Unread badge | Nav bell via `NavDrawerProvider` — **real** |
| Mark-read animation | `sb-notif-mark-read` 250ms — **real** |
| Data source | `/api/notifications` → `getPlayerNotifications` — **real** |

### Category mapping

| Category | Notification types |
|----------|-------------------|
| Contest | Board fill, numbers, kickoff, Pick'em pool/week events |
| Wallet | Payouts, payment sent |
| Rewards | Wins, streaks, rank up, achievements |
| Announcements | `platform_announcement` |
| Community / Security / Support | Filters ready; types stub until backend emits them |
| System | Fallback for unmapped types |

---

## Activity Center (`ActivityCenter`, `/my-games/activity`)

Chronological personal timeline via `/api/player/activity` → `buildPlayerActivityTimeline`.

| Event | Source | Status |
|-------|--------|--------|
| Joined platform | Legacy / ecosystem `memberSince` | **real** |
| Verified | Huddle `isVerified` | **real** |
| Tier up | Ecosystem `tierSlug` (non-rookie) | **real** |
| Achievements | `getPlayerLegacy` unlocked | **real** |
| Won | `getPlayerWinHighlights` | **real** |
| Joined contest | Player pool rows + pool metadata | **real** |
| Deposit / withdrawal / reward | `SquareWalletEngine.listTransactions` | **real** (when ledger configured) |

Reuses `PlayerActivityFeed` timeline styling (`player-timeline`, `sb-card-lift`).

---

## Notification Settings (`NotificationSettingsPanel`, `/my-games/notifications/settings`)

| Preference | Storage | Status |
|------------|---------|--------|
| Category toggles (8) | `preferenceState.ts` localStorage | **real (device)** |
| Push on/off | `player_push_subscriptions.enabled` via API | **real** |
| Email delivery | Toggle UI | **UI-ready stub** |
| Daily digest hour | `push_digest_settings` table exists | **not wired to player UI** |

Push enable uses existing `subscribeToPushNotifications` + `PATCH /api/player/notification-preferences`.

---

## Empty States

| Context | Copy |
|---------|------|
| `no_notifications` | "You're all caught up. We'll notify you when something important happens." |
| `no_activity_center` | "Your activity timeline will grow as you compete and interact on SquareBoards." |

---

## Micro-interactions & A11y

- Unread pulse dot + badge on nav bell
- 250ms transitions on tabs, toggles, cards
- `sb-card-lift` on notification and activity items
- `min-h-[44px]` tap targets on actions
- `aria-label` on mark/archive/delete/search
- `role="tablist"` / `role="switch"` on filters and toggles
- Keyboard: focus rings on hub tabs; list items keyboard-accessible via action buttons

---

## Files Changed

### New
- `components/player/NotificationHubShell.tsx`
- `components/player/ActivityCenter.tsx`
- `components/player/NotificationSettingsPanel.tsx`
- `lib/notifications/notificationMeta.ts`
- `lib/notifications/preferenceState.ts`
- `lib/notifications/buildPlayerActivity.ts`
- `app/api/player/activity/route.ts`
- `app/api/player/notification-preferences/route.ts`
- `app/my-games/(dashboard)/activity/page.tsx`
- `app/my-games/(dashboard)/notifications/settings/page.tsx`
- `docs/PHASE_3F_REPORT.md`

### Modified
- `components/player/NotificationCenter.tsx` — hub shell, filters, search, actions, polish
- `lib/notifications/readState.ts` — archive + delete IDs
- `lib/push/subscriptions.ts` — `listPlayerPushSubscriptions`, `setPlayerPushEnabled`
- `lib/platform/alive/emptyStateIntelligence.ts` — 3F empty copy + `no_activity_center`
- `app/globals.css` — mark-read animation, hub/toggle focus styles

### Untouched (frozen)
- Homepage, wallet pages, onboarding, rewards, contests, profile components (except shared empty-state lib)

---

## Build

`npm run build` — **passed** (Next.js 14.2.33)

---

## Future expansion

- Persist category preferences server-side (new migration)
- Emit Security / Support / Community notification types from backend
- Wire email delivery queue to category prefs
- Player-facing daily digest time picker (admin `push_digest_settings` exists)
