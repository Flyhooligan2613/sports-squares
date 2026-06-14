# SquareBoards Live Trial

**Play:** https://www.squareboards.pro  
**Support:** support@squareboards.pro

---

## Public — share this

### SquareBoards Live Trial is open

**SquareBoards** is live with real-money sports squares and pick'em — NFL, NBA, MLB, and more. We're opening to the **first 20 sign-ups** while we stress-test payments, cash-out, and gameplay before a full launch.

**→ https://www.squareboards.pro**

**Spots:** First **20 accounts** only. When we're full, new sign-ups will be paused until the next wave.

**Real money:** Entry fees and winnings use real cards and bank accounts via Stripe. Start with **$1 boards** so you know exactly what you're spending.

---

#### How to join (about 5 minutes)

1. Open **squareboards.pro** on your **phone** (Safari or Chrome works best).
2. Tap **Sign up** — create your account (name, address, email, password).
3. After sign-up, you'll see **Set up cash-out** — tap it and **complete every Stripe step** (identity + bank). You need this before you can play for real money.
4. From home, pick a sport and join a **$1** board.
5. Buy **one square** to start. Your square should show on the board within a minute.

**Tip:** Add SquareBoards to your **Home Screen** for the best app-like experience.

---

#### What you can play

| Mode | How to find it |
|------|----------------|
| **Sports squares** | Home → pick a sport → choose a board |
| **Pick'em** | Menu → Pick'em → Play This Week |
| **Profile & winnings** | My Games → profile or My Winnings |
| **Leaderboards** | Menu → Leaderboards |

Cash-out setup is required once before real-money play. Winnings go to your linked bank through Stripe — SquareBoards does not hold your balance.

---

#### Start small

- Use **$1 (beginner) boards** for your first games.
- One square on a $10 board costs **$10** — check the tier before you buy.
- Only play with money you're comfortable spending during a beta.

---

#### Need help?

| Issue | What to do |
|-------|------------|
| **Set up cash-out** error | Wait 2 minutes and try again from **My Winnings**. |
| **Paid but no square** | Screenshot your payment and the board → **support@squareboards.pro** |
| **Can't buy squares** | Finish cash-out setup under **My Winnings** first. |
| **Stuck in Stripe** | Complete all fields, or return to the app and tap **Set up cash-out** again. |

Email **support@squareboards.pro** with what happened, your device, and the email you signed up with. Screenshots help.

---

#### Beta expectations

- We're actively fixing bugs — your feedback shapes the full launch.
- Some modes may show **coming soon** placeholders.
- iPhone push alerts work best after **Add to Home Screen** and allowing notifications.
- After the first 20 players, we'll announce the next opening on the site and social channels.

Thanks for being an early SquareBoards player.

---

## Launch ops — private (you only)

Run this before posting publicly:

- [ ] Vercel Production: `sk_live_...`, live `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_ENABLED=true`, `STRIPE_CONNECT_V2_PAYOUTS=true`
- [ ] Live webhook → `https://www.squareboards.pro/api/webhooks/stripe` (`checkout.session.completed`, `charge.refunded`, `account.updated`)
- [ ] Supabase migration `041_player_profile_identity.sql` applied
- [ ] **You** completed cash-out + bought **1 square** on a **$1** board — square assigned
- [ ] Stripe Dashboard → Webhooks → test event shows **200**
- [ ] Track sign-ups — **stop at 20** (disable sign-ups or post "full" when limit hit)

**Admin repair:** `/admin/connect` → player email → **Inspect** / **Repair configuration**

---

*Last updated: June 2026 — SquareBoards Live Trial, first 20 public sign-ups.*
