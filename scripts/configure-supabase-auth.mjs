/**
 * Configure Supabase Auth URL settings for production magic links.
 *
 * Usage:
 *   npm run supabase:configure-auth
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_ACCESS_TOKEN=sbp_...   (from https://supabase.com/dashboard/account/tokens)
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

const SITE_URL = "https://www.squareboards.pro";
const REDIRECT_URLS = [
  "https://www.squareboards.pro/auth/callback",
  "http://localhost:3000/auth/callback",
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
    const host = new URL(url).hostname;
    return host.split(".")[0] ?? null;
  } catch {
    return null;
  }
}

const env = loadEnvLocal();
const supabaseUrl =
  env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const accessToken =
  env.SUPABASE_ACCESS_TOKEN?.trim() ||
  process.env.SUPABASE_ACCESS_TOKEN?.trim();

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
  console.error("Then run: npm run supabase:configure-auth");
  console.error("");
  process.exit(1);
}

const projectRef = projectRefFromUrl(supabaseUrl);
if (!projectRef) {
  console.error("Could not parse project ref from NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

async function main() {
  const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`;

  console.log(`Project: ${projectRef}`);
  console.log(`Site URL: ${SITE_URL}`);
  console.log("Redirect URLs:");
  for (const url of REDIRECT_URLS) console.log(`  - ${url}`);

  const response = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      site_url: SITE_URL,
      additional_redirect_urls: REDIRECT_URLS,
    }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("");
    console.error(`Failed (${response.status}):`, body.message ?? body);
    console.error("");
    process.exit(1);
  }

  console.log("");
  console.log("Supabase Auth URLs updated successfully.");
  console.log("");
  console.log("Verify:");
  console.log(
    `  https://supabase.com/dashboard/project/${projectRef}/auth/url-configuration`
  );
  console.log("");
  console.log("Request a new magic link at /my-games/login to test.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
