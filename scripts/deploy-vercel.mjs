/**
 * Production deploy helper for Vercel.
 *
 * Prerequisites:
 *   1. VERCEL_TOKEN — create at https://vercel.com/account/tokens
 *   2. .env.local with production values (NEXT_PUBLIC_APP_URL set after first deploy)
 *
 * Usage:
 *   set VERCEL_TOKEN=...   (PowerShell: $env:VERCEL_TOKEN="...")
 *   npm run deploy
 *
 * Optional:
 *   VERCEL_ORG_ID, VERCEL_PROJECT_ID — skip interactive link
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vercelBin = join(root, "node_modules", "vercel", "dist", "index.js");

function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
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

function runVercel(args, extraEnv = {}) {
  const result = spawnSync(process.execPath, [vercelBin, ...args], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const token = process.env.VERCEL_TOKEN;
if (!token) {
  console.error(
    "VERCEL_TOKEN is required. Create one at https://vercel.com/account/tokens"
  );
  process.exit(1);
}

const envLocal = parseEnvFile(join(root, ".env.local"));
const productionKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_DB_READ_PHASE",
  "RESEND_FROM_EMAIL",
];

console.log("Syncing production environment variables to Vercel...");
for (const key of productionKeys) {
  const value = envLocal[key] ?? process.env[key];
  if (!value) {
    console.warn(`  skip ${key} (not set)`);
    continue;
  }
  if (key === "NEXT_PUBLIC_APP_URL" && value.includes("localhost")) {
    console.warn(`  skip ${key} (still localhost — set after first deploy)`);
    continue;
  }
  console.log(`  set ${key}`);
  const input = `${value}\n`;
  const result = spawnSync(
    process.execPath,
    [vercelBin, "env", "add", key, "production", "--force"],
    {
      cwd: root,
      input,
      env: { ...process.env, VERCEL_TOKEN: token },
    }
  );
  if (result.status !== 0) {
    console.error(`Failed to set ${key}`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nDeploying to production...");
runVercel(["deploy", "--prod", "--yes", "--token", token]);

console.log("\nDone. Update NEXT_PUBLIC_APP_URL to your production URL and re-run if needed.");
console.log("Configure Stripe webhook: https://<your-domain>/api/webhooks/stripe");
