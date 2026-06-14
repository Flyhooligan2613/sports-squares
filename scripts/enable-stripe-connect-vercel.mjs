import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vercelBin = join(root, "node_modules", "vercel", "dist", "index.js");

const keys = [
  { key: "STRIPE_CONNECT_ENABLED", value: "true" },
  { key: "STRIPE_CONNECT_V2_PAYOUTS", value: "true" },
];

console.log("Enabling Stripe Connect on Vercel production...");

for (const { key, value } of keys) {
  console.log(`  set ${key}=${value}`);
  const result = spawnSync(
    process.execPath,
    [vercelBin, "env", "add", key, "production", "--force"],
    {
      cwd: root,
      input: `${value}\n`,
      stdio: ["pipe", "inherit", "inherit"],
    }
  );

  if (result.status !== 0) {
    console.error(`Failed to set ${key}`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nDone. Redeploy production for the env var to take effect:");
console.log("  node node_modules/vercel/dist/index.js deploy --prod --yes");
