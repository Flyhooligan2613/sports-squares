/**
 * One-shot setup helper for Stripe Connect sample.
 * Opens browser tabs, copies migration SQL, runs verification, and smoke-tests the API.
 *
 * Usage: node scripts/setup-connect-sample.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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

function projectRefFromUrl(url) {
  try {
    return new URL(url).hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
}

async function checkTable(env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return false;
  const res = await fetch(
    `${url}/rest/v1/connect_sample_accounts?select=demo_user_email&limit=1`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  return res.ok;
}

async function smokeTestCreateAccount() {
  const ports = [3000, 3001];
  for (const port of ports) {
    try {
      const res = await fetch(`http://localhost:${port}/api/connect-sample/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: "SquareBoards Demo",
          contactEmail: "merchant@example.com",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.accountId) {
        return { ok: true, port, accountId: json.accountId };
      }
      return { ok: false, port, error: json.error ?? res.statusText };
    } catch {
      // try next port
    }
  }
  return { ok: false, error: "Dev server not running on :3000 or :3001" };
}

const env = loadEnvLocal();
const projectRef = projectRefFromUrl(env.NEXT_PUBLIC_SUPABASE_URL ?? "");

console.log("\n=== Stripe Connect Sample Setup ===\n");

// 1. Migration clipboard + SQL editor
spawnSync("node", ["scripts/open-connect-sample-migration.mjs"], {
  cwd: root,
  stdio: "inherit",
});

// 2. Stripe Connect settings
spawnSync("cmd", ["/c", "start", "", "https://dashboard.stripe.com/test/settings/connect"], {
  stdio: "ignore",
});

// 3. Connect sample UI
spawnSync("cmd", ["/c", "start", "", "http://localhost:3000/connect-sample"], {
  stdio: "ignore",
});

// 4. Verify
console.log("\n--- Verification ---\n");
spawnSync("node", ["scripts/verify-connect-sample-setup.mjs"], {
  cwd: root,
  stdio: "inherit",
});

const migrationOk = await checkTable(env);
console.log(
  migrationOk
    ? "\n✓ Migration 019 already applied."
    : "\n✗ Migration 019 pending — paste SQL in Supabase and click Run."
);

if (projectRef && !migrationOk) {
  console.log(`  https://supabase.com/dashboard/project/${projectRef}/sql/new`);
}

// 5. API smoke test
console.log("\n--- API smoke test ---\n");
const test = await smokeTestCreateAccount();
if (test.ok) {
  console.log(`✓ Created account ${test.accountId} on localhost:${test.port}`);
  console.log(`  Storefront: http://localhost:${test.port}/connect-sample/storefront/${test.accountId}`);
} else {
  console.log(`✗ Create account failed: ${test.error}`);
  if (String(test.error).includes("Accounts v2 is not enabled")) {
    console.log("\n  → Enable Accounts v2 in Stripe Connect settings (browser tab opened).");
  }
}

console.log("\n--- Manual steps only you can do ---");
console.log("1. Supabase SQL Editor: Ctrl+V → Run (migration in clipboard)");
console.log("2. Stripe Dashboard (Test mode): enable Accounts v2");
console.log("3. If you exposed sk_test_ in chat: roll key at dashboard.stripe.com/test/apikeys");
console.log("4. Re-run: npm run connect-sample:setup\n");
