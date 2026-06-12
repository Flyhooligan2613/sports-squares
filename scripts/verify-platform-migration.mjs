/**
 * Verify platform core migration 023.
 * Usage: npm run platform:verify-migration
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

const checks = [
  { label: "platform_audit_log", path: "platform_audit_log?select=id&limit=1" },
  { label: "platform_growth_fund_ledger", path: "platform_growth_fund_ledger?select=id&limit=1" },
  { label: "squares.platform_owned", path: "squares?select=platform_owned&limit=1" },
  { label: "pools.entry_tier_cents", path: "pools?select=entry_tier_cents&limit=1" },
  { label: "pickem_leagues.entry_tier_cents", path: "pickem_leagues?select=entry_tier_cents&limit=1" },
  { label: "support_threads.priority", path: "support_threads?select=priority&limit=1" },
];

console.log("");
console.log("Platform migration 023 check");
console.log("============================");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let failed = 0;

for (const check of checks) {
  const res = await fetch(`${url}/rest/v1/${check.path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (res.ok) {
    console.log(`✓ ${check.label}`);
  } else {
    failed += 1;
    const text = await res.text();
    console.log(`✗ ${check.label} — HTTP ${res.status}`);
    console.log(`  ${text.slice(0, 200)}`);
  }
}

console.log("");
if (failed === 0) {
  console.log("All checks passed. Platform core tables and columns are live.");
} else {
  console.log(`${failed} check(s) failed. Re-run 023_platform_core.sql in Supabase SQL Editor.`);
}
console.log("");

process.exit(failed > 0 ? 1 : 0);
