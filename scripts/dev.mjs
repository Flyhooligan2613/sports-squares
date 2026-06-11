import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";

// Local dev only — fixes UNABLE_TO_VERIFY_LEAF_SIGNATURE on some Windows networks.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// .env.local must win over machine-level env vars (e.g. stale STRIPE_SECRET_KEY).
const envLocalPath = join(process.cwd(), ".env.local");
try {
  for (const line of readFileSync(envLocalPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key) process.env[key] = value;
  }
} catch {
  // .env.local is optional until first setup.
}

const child = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
