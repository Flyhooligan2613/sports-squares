/**
 * Update STRIPE_SECRET_KEY in .env.local (interactive, local only).
 * Opens Stripe API keys page, then prompts you to paste the new test secret key.
 *
 * Usage: node scripts/set-stripe-test-key.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

function openUrl(url) {
  spawnSync("cmd", ["/c", "start", "", url], { stdio: "ignore" });
}

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  if (!existsSync(envPath)) {
    console.error("Missing .env.local — copy from .env.local.example first.");
    process.exit(1);
  }

  console.log("\n=== Update Stripe test secret key ===\n");
  console.log("1. Opening Stripe API keys (Test mode)...");
  console.log("   Use the account where Accounts v2 is ENABLED.");
  console.log("   URL should contain acct_1Th... (your new account), not acct_1Q02...\n");

  openUrl("https://dashboard.stripe.com/test/apikeys");
  spawnSync("notepad", [envPath], { stdio: "ignore" });

  const key = await prompt(
    "\n2. Paste your sk_test_... secret key here (input hidden from chat logs):\n> "
  );

  if (!key.startsWith("sk_test_")) {
    console.error("\nExpected a test secret key starting with sk_test_");
    process.exit(1);
  }

  let content = readFileSync(envPath, "utf8");
  const line = `STRIPE_SECRET_KEY=${key}`;

  if (/^STRIPE_SECRET_KEY=/m.test(content)) {
    content = content.replace(/^STRIPE_SECRET_KEY=.*$/m, line);
  } else {
    content += `\n${line}\n`;
  }

  writeFileSync(envPath, content, "utf8");
  console.log("\n✓ Updated STRIPE_SECRET_KEY in .env.local");
  console.log(`  Key prefix: ${key.slice(0, 16)}...`);
  console.log("\n3. Restart dev server (Ctrl+C, then npm run dev)");
  console.log("4. Run: npm run connect-sample:setup\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
