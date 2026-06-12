/**
 * Copy migration 019 to clipboard and open Supabase SQL Editor.
 * Usage: node scripts/open-connect-sample-migration.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const sqlPath = join(root, "supabase", "migrations", "019_connect_sample_accounts.sql");

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
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}

const projectRef = projectRefFromUrl(supabaseUrl);
if (!projectRef || !existsSync(sqlPath)) {
  console.error("Could not resolve project ref or migration file.");
  process.exit(1);
}

const sql = readFileSync(sqlPath, "utf8").trim();
const clip = spawnSync(
  "powershell",
  ["-NoProfile", "-Command", "Set-Clipboard -Value $input"],
  { input: sql, encoding: "utf8" }
);

if (clip.status !== 0) {
  console.error("Could not copy SQL to clipboard.");
  process.exit(clip.status ?? 1);
}

const url = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;
spawnSync("cmd", ["/c", "start", "", url], { stdio: "ignore" });

console.log("Migration 019 copied to clipboard.");
console.log("Paste into Supabase SQL Editor and click Run:");
console.log(url);
