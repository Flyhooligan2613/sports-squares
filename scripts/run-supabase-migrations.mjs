/**
 * Run pending Supabase SQL migrations via Management API.
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_ACCESS_TOKEN=sbp_...  (https://supabase.com/dashboard/account/tokens)
 *
 * Usage:
 *   npm run supabase:migrate
 *   npm run supabase:migrate -- 017_stripe_connect.sql
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const migrationsDir = join(root, "supabase", "migrations");

const DEFAULT_MIGRATIONS = [
  "013_support_messages.sql",
  "014_payment_hardening.sql",
  "015_payout_jobs.sql",
  "016_player_profiles.sql",
  "017_stripe_connect.sql",
  "018_player_profiles_service_role.sql",
  "019_connect_sample_accounts.sql",
];

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

function projectRefFromUrl(url) {
  try {
    return new URL(url).hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
}

async function runQuery(projectRef, accessToken, sql) {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      body.message ??
      body.error ??
      body.error_description ??
      JSON.stringify(body);
    throw new Error(`${response.status}: ${message}`);
  }

  return body;
}

function resolveMigrationFiles(args) {
  const filtered = args.filter((arg) => !arg.startsWith("--"));
  if (filtered.length > 0) {
    return filtered.map((name) =>
      name.endsWith(".sql") ? join(migrationsDir, name) : join(migrationsDir, `${name}.sql`)
    );
  }

  return DEFAULT_MIGRATIONS.map((name) => join(migrationsDir, name));
}

function readArg(flag) {
  const args = process.argv.slice(2);
  const index = args.indexOf(flag);
  if (index === -1) return null;
  return args[index + 1]?.trim() || null;
}

async function main() {
  const env = loadEnvLocal();
  const supabaseUrl =
    env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const accessToken =
    readArg("--token") ??
    (env.SUPABASE_ACCESS_TOKEN?.trim() ||
      process.env.SUPABASE_ACCESS_TOKEN?.trim());

  if (!supabaseUrl) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
    process.exit(1);
  }

  if (!accessToken) {
    console.error("");
    console.error("Missing SUPABASE_ACCESS_TOKEN.");
    console.error("");
    console.error("1. Open https://supabase.com/dashboard/account/tokens");
    console.error("2. Generate a token (name: squareboards-cli)");
    console.error("3. Add to .env.local:");
    console.error("   SUPABASE_ACCESS_TOKEN=sbp_...");
    console.error("");
    console.error("Then run: npm run supabase:migrate");
    console.error("");
    console.error(
      "Or paste migrations manually in Supabase SQL Editor (Dashboard → SQL):"
    );
    for (const name of DEFAULT_MIGRATIONS) {
      console.error(`  - supabase/migrations/${name}`);
    }
    process.exit(1);
  }

  const projectRef = projectRefFromUrl(supabaseUrl);
  if (!projectRef) {
    console.error("Could not parse project ref from NEXT_PUBLIC_SUPABASE_URL");
    process.exit(1);
  }

  const files = resolveMigrationFiles(process.argv.slice(2));
  console.log(`Project: ${projectRef}`);
  console.log(`Running ${files.length} migration(s)...\n`);

  for (const file of files) {
    if (!existsSync(file)) {
      console.error(`Missing migration file: ${file}`);
      process.exit(1);
    }

    const sql = readFileSync(file, "utf8").trim();
    const name = file.split(/[/\\]/).pop();
    console.log(`→ ${name}`);

    try {
      await runQuery(projectRef, accessToken, sql);
      console.log(`  ✓ applied\n`);
    } catch (err) {
      console.error(`  ✗ failed: ${err instanceof Error ? err.message : err}\n`);
      process.exit(1);
    }
  }

  console.log("All migrations applied successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
