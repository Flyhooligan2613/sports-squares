/**
 * Verify Stripe Connect sample setup (env, migration, deploy, SDK).
 * Usage: node scripts/verify-connect-sample-setup.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Windows dev environments sometimes fail TLS verification against Supabase/Vercel.
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === undefined) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

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

function stripeVersion() {
  try {
    const pkg = JSON.parse(
      readFileSync(join(root, "node_modules", "stripe", "package.json"), "utf8")
    );
    return pkg.version;
  } catch {
    return "not installed";
  }
}

async function checkTable(env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return { ok: false, message: "Supabase env missing" };

  const res = await fetch(
    `${url}/rest/v1/connect_sample_accounts?select=demo_user_email&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    }
  );
  const body = await res.json().catch(() => ({}));
  if (res.ok) return { ok: true, message: "connect_sample_accounts table exists" };
  return {
    ok: false,
    message: body.message ?? `HTTP ${res.status}`,
  };
}

async function checkDeploy() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    loadEnvLocal().NEXT_PUBLIC_APP_URL?.trim() ||
    "https://www.squareboards.pro";
  const base = appUrl.replace(/\/$/, "");
  const res = await fetch(`${base}/connect-sample`, { redirect: "follow" });
  return { ok: res.ok, message: `${base}/connect-sample → ${res.status}` };
}

const env = loadEnvLocal();
const sk = env.STRIPE_SECRET_KEY ?? "";
const checks = [];

checks.push({
  name: "STRIPE_SECRET_KEY (test mode)",
  ok: sk.startsWith("sk_test_"),
  message: sk.startsWith("sk_test_")
    ? "sk_test_… configured"
    : sk.startsWith("sk_live_")
      ? "Using LIVE key — switch to test for development"
      : "Missing STRIPE_SECRET_KEY",
});

checks.push({
  name: "Stripe SDK version",
  ok: Number.parseInt(stripeVersion(), 10) >= 22,
  message: `stripe@${stripeVersion()} (need v22+ for Accounts v2)`,
});

checks.push({
  name: "Migration 019",
  ...(await checkTable(env)),
});

checks.push({
  name: "Production deploy",
  ...(await checkDeploy()),
});

console.log("\nStripe Connect Sample — setup check\n");
for (const c of checks) {
  console.log(`${c.ok ? "✓" : "✗"} ${c.name}: ${c.message}`);
}
console.log("");
const failed = checks.filter((c) => !c.ok);
if (failed.length === 0) {
  console.log("All checks passed. Open /connect-sample to test.");
} else {
  console.log(`${failed.length} item(s) need attention — see docs/STRIPE_CONNECT_SAMPLE.md`);
  process.exitCode = 1;
}
