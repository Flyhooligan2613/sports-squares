/**
 * Trigger production marketplace sync (games import + auto boards).
 *
 * Usage:
 *   npm run marketplace:sync
 *
 * Requires in .env.local:
 *   CRON_SECRET=your-secret
 *   PRODUCTION_APP_URL=https://www.squareboards.pro
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
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
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
  console.error("");
  console.error("Missing CRON_SECRET.");
  console.error("");
  console.error("Add this line to .env.local (same value as Vercel):");
  console.error("  CRON_SECRET=your-secret-here");
  console.error("");
  process.exit(1);
}

const url = `${appUrl}/api/cron/marketplace-sync`;

console.log("");
console.log("SquareBoards marketplace sync");
console.log("==============================");
console.log(`Target: ${url}`);
console.log("");
console.log("Calling server… (first request can take 30–90 seconds)");
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
    console.error("Unauthorized — CRON_SECRET does not match Vercel. Fix and redeploy.");
    process.exit(1);
  }
  if (response.status === 503) {
    console.error("CRON_SECRET not configured on Vercel. Add it and redeploy.");
    process.exit(1);
  }
  if (!response.ok) {
    process.exit(1);
  }

  console.log("Success. Check Supabase → games table, then refresh squareboards.pro");
  console.log("");
} catch (err) {
  if (err instanceof Error && err.name === "AbortError") {
    console.error("Timed out after 120 seconds. Try again or check Vercel logs.");
  } else {
    console.error("Request failed:", err instanceof Error ? err.message : err);
  }
  process.exit(1);
} finally {
  clearTimeout(timeout);
}
