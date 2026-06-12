/**
 * Verify Pick'em migration 022 tables exist in Supabase.
 * Usage: npm run pickem:verify-migration
 */
import { readFileSync, existsSync } from "node:fs";
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
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[trimmed.slice(0, eq).trim()] = value;
  }
  return out;
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const tables = [
  "pickem_leagues",
  "pickem_payouts",
  "pickem_weekly_snapshots",
  "pickem_entry_purchases",
  "pickem_tiebreakers",
  "pickem_tiebreaker_entries",
  "pickem_player_week_results",
  "pickem_week_history",
  "pickem_season_archives",
  "pickem_season_standings",
  "platform_announcements",
  "platform_announcement_dismissals",
];

console.log("");
console.log("Pick'em migration check (022 + 025 + 026 + 027 + 028)");
console.log("==========================================");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

for (const table of tables) {
  const res = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (res.ok) {
    console.log(`✓ ${table}`);
  } else {
    const text = await res.text();
    console.log(`✗ ${table} — HTTP ${res.status}`);
    console.log(`  ${text.slice(0, 200)}`);
  }
}

console.log("");
console.log("If tiebreaker/history tables show ✗, run 026_pickem_tiebreaker_platform.sql in Supabase SQL Editor.");
console.log("If pickem_entry_purchases shows ✗, run 025_pickem_entry_purchases.sql in Supabase SQL Editor.");
console.log("If leagues/payouts show ✗, run 022_pickem_leagues_payouts.sql in Supabase SQL Editor.");
console.log("If hall of fame tables show ✗, run 027_pickem_hall_of_fame.sql in Supabase SQL Editor.");
console.log("If announcement tables show ✗, run 028_platform_announcements.sql in Supabase SQL Editor.");
console.log("");
