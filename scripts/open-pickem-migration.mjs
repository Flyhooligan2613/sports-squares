/**
 * Copy Pick'em migration 021 to clipboard and open Supabase SQL Editor.
 *
 * Usage: npm run supabase:migrate:pickem
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const migrationPath = join(root, "supabase", "migrations", "022_pickem_leagues_payouts.sql");

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
if (!projectRef || !existsSync(migrationPath)) {
  console.error("Could not open Pick'em migration.");
  process.exit(1);
}

const sql = readFileSync(migrationPath, "utf8");
const lineCount = sql.split(/\r?\n/).length;

// clip.exe is more reliable on Windows than piping to Set-Clipboard
spawnSync("cmd", ["/c", "clip"], { input: sql, encoding: "utf8" });

// Also open the file in Notepad so you can copy manually if clipboard fails
spawnSync("cmd", ["/c", "start", "", "notepad", migrationPath], { stdio: "ignore" });

const editorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;
spawnSync("cmd", ["/c", "start", "", editorUrl], { stdio: "ignore" });

console.log(`Pick'em migration copied to clipboard (${lineCount} lines).`);
console.log(`File opened in Notepad: ${migrationPath}`);
console.log(`Opened: ${editorUrl}`);
console.log("");
console.log("In Supabase:");
console.log("  1. Ctrl+A → Delete (clear editor)");
console.log("  2. Ctrl+V (must show ALL lines — scroll to line ~94)");
console.log("  3. Run");
console.log("");
console.log("If paste is still truncated, copy from Notepad instead.");
console.log("Then: npm run pickem:sync");
