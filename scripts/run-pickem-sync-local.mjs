/**
 * Run Pick'em sync locally (uses .env.local Supabase + ESPN).
 * Usage: npm run pickem:sync:local
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
for (const [key, value] of Object.entries(env)) {
  if (!process.env[key]) process.env[key] = value;
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { syncAllPickemContests } = await import("../lib/pickem/engine/syncContest.ts");

try {
  const result = await syncAllPickemContests("nfl");
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error("Sync failed:");
  console.error(err instanceof Error ? err.message : err);
  if (typeof err === "object" && err !== null) {
    console.error(JSON.stringify(err, null, 2));
  }
  process.exit(1);
}
