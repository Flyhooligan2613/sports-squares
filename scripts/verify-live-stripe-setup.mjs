/**
 * Live Stripe + Connect readiness checklist (reads .env.local for local hints).
 * Production values live in Vercel — confirm there too.
 *
 * Usage: node scripts/verify-live-stripe-setup.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

function loadEnvLocal() {
  if (!existsSync(envPath)) return {};
  const out = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return out;
}

const env = loadEnvLocal();
const sk = env.STRIPE_SECRET_KEY ?? "";
const wh = env.STRIPE_WEBHOOK_SECRET ?? "";
const connect = env.STRIPE_CONNECT_ENABLED ?? "";
const v2 = env.STRIPE_CONNECT_V2_PAYOUTS ?? "";
const appUrl = env.NEXT_PUBLIC_APP_URL ?? env.PRODUCTION_APP_URL ?? "";

console.log("\n=== SquareBoards — Live Stripe checklist ===\n");

const rows = [
  {
    label: "STRIPE_SECRET_KEY is live",
    ok: sk.startsWith("sk_live_"),
    hint: sk.startsWith("sk_test_")
      ? "Local .env still has sk_test_ — OK for dev; Vercel Production should use sk_live_ for your trial."
      : "Set sk_live_... in Vercel Production.",
  },
  {
    label: "STRIPE_WEBHOOK_SECRET set",
    ok: wh.startsWith("whsec_"),
    hint: "Create a LIVE webhook at dashboard.stripe.com/webhooks → endpoint https://www.squareboards.pro/api/webhooks/stripe",
  },
  {
    label: "STRIPE_CONNECT_ENABLED=true",
    ok: connect === "true",
    hint: "Required for cash-out accounts.",
  },
  {
    label: "STRIPE_CONNECT_V2_PAYOUTS=true",
    ok: v2 === "true",
    hint: "Required for winner payout transfers.",
  },
  {
    label: "App URL points to production",
    ok: appUrl.includes("squareboards.pro"),
    hint: "NEXT_PUBLIC_APP_URL=https://www.squareboards.pro in Vercel.",
  },
];

for (const row of rows) {
  console.log(`${row.ok ? "OK  " : "!!  "}${row.label}`);
  if (!row.ok) console.log(`     → ${row.hint}`);
}

console.log(`
Stripe Dashboard (LIVE — test mode OFF):
  1. Connect → Settings → Accounts v2 ON
  2. Connect → Platform pricing → fallback 0% / $0
  3. Webhook events: checkout.session.completed, charge.refunded, account.updated
  4. Business activation complete (payments enabled)

Friend trial flow:
  1. Sign up in app
  2. My Winnings → Set up cash-out → finish ALL Stripe steps
  3. Buy $1 square on an open board (real card)
  4. You: /admin/connect → their email → Inspect / Repair if needed

Supabase: run migration 041_player_profile_identity.sql if not done yet.
`);

const failed = rows.filter((r) => !r.ok).length;
process.exit(failed > 0 ? 1 : 0);
