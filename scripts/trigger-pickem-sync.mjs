/**
 * Trigger production Pick'em sync (NFL slate import + grading).
 *
 * Usage: npm run pickem:sync
 *
 * Requires in .env.local (same CRON_SECRET as Vercel):
 *   CRON_SECRET=...
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
const secret = env.CRON_SECRET?.trim() || process.env.CRON_SECRET?.trim();
const appUrl = (
  env.PRODUCTION_APP_URL ||
  process.env.PRODUCTION_APP_URL ||
  "https://www.squareboards.pro"
).replace(/\/$/, "");

if (!secret) {
  console.error("Missing CRON_SECRET in .env.local (must match Vercel).");
  process.exit(1);
}

const url = `${appUrl}/api/cron/pickem-sync`;

console.log("");
console.log("SquareBoards Pick'em sync");
console.log("=========================");
console.log(`Target: ${url}`);
console.log("");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 120_000);

try {
  const started = Date.now();
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
    signal: controller.signal,
  });

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  const text = await response.text();

  console.log(`Response in ${elapsed}s — HTTP ${response.status}`);
  console.log("");

  if (text) {
    try {
      console.log(JSON.stringify(JSON.parse(text), null, 2));
    } catch {
      console.log(text);
    }
  }

  console.log("");

  if (response.status === 401) {
    console.error("Unauthorized — CRON_SECRET does not match Vercel.");
    process.exit(1);
  }
  if (response.status === 503) {
    console.error("CRON_SECRET not set on Vercel. Add it and redeploy.");
    process.exit(1);
  }
  if (!response.ok) {
    console.error("Sync failed.");
    console.error("If error mentions a missing column/table, run migration 022 in Supabase:");
    console.error("  Open: supabase/migrations/022_pickem_leagues_payouts.sql");
    console.error("  Copy all lines → paste in Supabase SQL Editor → Run");
    process.exit(1);
  }

  console.log("Success. Open:");
  console.log(`  ${appUrl}/pickem/week`);
  console.log("");
} catch (err) {
  console.error("Request failed:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  clearTimeout(timeout);
}
