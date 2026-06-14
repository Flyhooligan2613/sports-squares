# SquareBoards — Test Launch Checklist

**Production URL:** https://www.squareboards.pro  
**Support:** support@squareboards.pro

Use this doc in two ways:

1. **Owner checklist** — complete before inviting testers  
2. **Tester checklist** — copy the bottom section to friends / beta group

---

## Owner pre-launch (do once)

### Database (Supabase SQL Editor)

Run these migrations in order if not already applied:

| Migration | Purpose |
|-----------|---------|
| `038_player_public_identity.sql` | Public profile bio + username |
| `039_huddle_social.sql` | The Huddle, follow/unfollow |
| `040_player_push_notifications.sql` | Push subscriptions + daily digest |

**Skip** `040_payment_payout_verification.sql` — payout gate uses Stripe Connect only.

Optional helpers from project folder:

```bash
npm run supabase:migrate:open
```

### Vercel environment variables

Confirm these are set in **Production**:

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only |
| `NEXT_PUBLIC_DB_READ_PHASE` | `2` for production |
| `NEXT_PUBLIC_APP_URL` | `https://www.squareboards.pro` |
| `PRODUCTION_APP_URL` | Same as above (for sync scripts) |
| `CRON_SECRET` | Random secret; crons won't run without it |
| `STRIPE_SECRET_KEY` | Test key OK for soft launch |
| `STRIPE_CONNECT_ENABLED` | `true` if testing payouts |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push notifications |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Generate: `npm run push:generate-vapid` |
| `RESEND_API_KEY` + `RESEND_FROM_EMAIL` | Magic link / email |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Staff admin access |

### Supabase Auth

In **Authentication → URL Configuration**:

- **Site URL:** `https://www.squareboards.pro`
- **Redirect URLs:**
  - `https://www.squareboards.pro/auth/callback`
  - `http://localhost:3000/auth/callback` (for local dev)

Or run: `npm run supabase:configure-auth`

### Seed live game data

From the project folder (uses `.env.local` / production URL):

```bash
npm run pickem:sync
npm run marketplace:sync
```

Verify boards appear on the home **Browse Games** section and Pick'em week pages.

### Owner smoke test (15 minutes)

On a **real phone** (PWA if possible):

- [ ] Home loads — search bar, sport chips, Browse Games  
- [ ] Sign in (magic link email arrives)  
- [ ] Complete **Stripe Connect** cash-out setup (required before play)  
- [ ] Buy a test square (Stripe test card below)  
- [ ] Make Pick'em picks (NFL + MLB if in season)  
- [ ] Open a public profile `/player/[slug]` — follow / unfollow  
- [ ] Global search (`Ctrl+K` / tap search) — find a player + jump to Huddle  
- [ ] Install to home screen → close app → reopen (splash animation)  
- [ ] Enable push notifications when prompted  
- [ ] Settings + Referrals icons in header work  

### Monitor first 48 hours

- [ ] Vercel → **Cron** logs (marketplace-sync, pickem-sync, winner-sync, push-digest)  
- [ ] Supabase → table row growth (pools, pickem, push subscriptions)  
- [ ] Stripe Dashboard → test payments / Connect accounts  

---

## Share with testers (copy below)

---

### SquareBoards Beta — You're invited

We're testing **SquareBoards** before a wider launch. Your feedback on bugs, confusion, and mobile UX is the goal — not perfection.

**App:** https://www.squareboards.pro

#### Getting started

1. Open the link on your phone (Safari or Chrome).  
2. **Add to Home Screen** for the best experience (optional but recommended).  
3. **Sign in** with your email (magic link — check spam).  
4. Set up **cash-out / wallet** (Stripe Connect) — required before buying squares or entering Pick'em.  
5. Explore home → pick a sport → browse games, or try **Pick'em** / **MLB Pick'em** from the menu.

#### What to try

| Area | What to do |
|------|------------|
| **Squares** | Home → sport → pick a game → buy squares (test card below) |
| **Pick'em** | Menu → Pick'em → Play This Week → submit picks |
| **Social** | Search for a player → view profile → Follow |
| **The Huddle** | Menu → The Huddle → browse feed |
| **Profile** | My Games → profile, referrals, winnings |
| **Search** | Home search bar or `Ctrl+K` (desktop) — try `pickem`, `wallet`, `@username` |

#### Test payment (Stripe test mode only)

If checkout asks for a card:

- **Number:** `4242 4242 4242 4242`  
- **Expiry:** any future date  
- **CVC:** any 3 digits  
- **ZIP:** any 5 digits  

No real money is charged in test mode.

#### Please report

Send issues to **support@squareboards.pro** (or your group's chat) with:

1. **What you tried** (e.g. "bought NFL squares")  
2. **What happened** vs what you expected  
3. **Device** (iPhone 15 / Android / desktop)  
4. **Screenshot** if possible  

#### Known limitations (beta)

- Some games (Survivor, Brackets, etc.) are **coming soon** — placeholders only  
- Push alerts require **PWA install + notification permission**  
- Small UI tweaks may ship during the test — hard refresh or reinstall PWA if something looks stale  

Thanks for helping us launch SquareBoards the right way.

---

*Last updated: June 2026 — aligned with migrations 038–040 and current `main` deploy.*
