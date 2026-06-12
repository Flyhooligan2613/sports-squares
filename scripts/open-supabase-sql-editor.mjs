/**
 * Copy pending migrations to clipboard and open Supabase SQL Editor.
 *
 * Usage: npm run supabase:migrate:open
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const migrationsDir = join(root, "supabase", "migrations");

const FILES = [
  "013_support_messages.sql",
  "014_payment_hardening.sql",
  "015_payout_jobs.sql",
  "016_player_profiles.sql",
  "017_stripe_connect.sql",
];

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

const env = loadEnvLocal();
const supabaseUrl =
  env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}

const projectRef = projectRefFromUrl(supabaseUrl);
if (!projectRef) {
  console.error("Could not parse Supabase project ref.");
  process.exit(1);
}

const parts = FILES.map((name) => {
  const path = join(migrationsDir, name);
  if (!existsSync(path)) {
    console.error(`Missing ${path}`);
    process.exit(1);
  }
  return `-- ===== ${name} =====\n${readFileSync(path, "utf8").trim()}`;
});

const sql = `${parts.join("\n\n")}\n`;

const clip = spawnSync(
  "powershell",
  ["-NoProfile", "-Command", "Set-Clipboard -Value $input"],
  { input: sql, encoding: "utf8" }
);

if (clip.status !== 0) {
  console.error("Could not copy SQL to clipboard.");
  process.exit(clip.status ?? 1);
}

const editorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;
spawnSync("cmd", ["/c", "start", "", editorUrl], { stdio: "ignore" });

console.log("Pending migrations copied to your clipboard.");
console.log(`Opened SQL Editor: ${editorUrl}`);
console.log("");
console.log("In Supabase: paste (Ctrl+V) and click Run.");
