import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const vercelBin = join(root, "node_modules", "vercel", "dist", "index.js");

function loadEnv() {
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

const env = loadEnv();
const key = env.RESEND_API_KEY?.trim();
if (!key) {
  console.error("RESEND_API_KEY missing in .env.local");
  process.exit(1);
}

console.log("Setting Vercel RESEND_API_KEY from .env.local...");
const result = spawnSync(
  process.execPath,
  [vercelBin, "env", "add", "RESEND_API_KEY", "production", "--force"],
  {
    cwd: root,
    input: `${key}\n`,
    stdio: ["pipe", "inherit", "inherit"],
  }
);

process.exit(result.status ?? 1);
