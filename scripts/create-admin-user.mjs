/**
 * Create or update a Supabase Auth user for staff portal access.
 * Uses Supabase Auth REST API (no WebSocket — works on Node 20).
 *
 * Usage (PowerShell):
 *   $env:ADMIN_EMAIL="you@example.com"
 *   $env:ADMIN_PASSWORD="YourSecurePassword123!"
 *   npm run admin:create-user
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

function loadEnvLocal() {
  if (!existsSync(envPath)) return { content: "", vars: {} };
  const content = readFileSync(envPath, "utf8");
  const vars = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[trimmed.slice(0, eq).trim()] = value;
  }
  return { content, vars };
}

function upsertEnvVar(key, value) {
  const { content } = loadEnvLocal();
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");

  if (pattern.test(content)) {
    writeFileSync(envPath, content.replace(pattern, line), "utf8");
  } else {
    const suffix = content.endsWith("\n") || content.length === 0 ? "" : "\n";
    writeFileSync(envPath, `${content}${suffix}${line}\n`, "utf8");
  }
}

const local = loadEnvLocal();
const env = { ...local.vars, ...process.env };
const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const email = env.ADMIN_EMAIL?.trim().toLowerCase();
const password = env.ADMIN_PASSWORD?.trim();

if (!baseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

if (!email || !password) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.");
  console.error("");
  console.error("  PowerShell example:");
  console.error('    $env:ADMIN_EMAIL="you@example.com"');
  console.error('    $env:ADMIN_PASSWORD="YourSecurePassword123!"');
  console.error("    npm run admin:create-user");
  process.exit(1);
}

if (password.length < 8) {
  console.error("ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const authHeaders = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};

async function authFetch(path, options = {}) {
  const res = await fetch(`${baseUrl}/auth/v1${path}`, {
    ...options,
    headers: { ...authHeaders, ...options.headers },
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, json, text };
}

async function findUserByEmail(targetEmail) {
  let page = 1;
  while (page <= 10) {
    const { ok, json, text } = await authFetch(
      `/admin/users?page=${page}&per_page=200`
    );
    if (!ok) {
      throw new Error(json?.message ?? json?.error ?? text ?? "Failed to list users.");
    }
    const users = json?.users ?? [];
    const match = users.find((u) => u.email?.toLowerCase() === targetEmail);
    if (match) return match;
    if (users.length < 200) break;
    page += 1;
  }
  return null;
}

try {
  const existing = await findUserByEmail(email);

  if (existing) {
    const { ok, json, text } = await authFetch(`/admin/users/${existing.id}`, {
      method: "PUT",
      body: JSON.stringify({ password, email_confirm: true }),
    });
    if (!ok) {
      throw new Error(json?.message ?? json?.error ?? text ?? "Failed to update password.");
    }
    console.log(`Updated password for existing user: ${email}`);
  } else {
    const { ok, json, text } = await authFetch("/admin/users", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
      }),
    });
    if (!ok) {
      throw new Error(json?.message ?? json?.error ?? text ?? "Failed to create user.");
    }
    console.log(`Created admin auth user: ${email}`);
  }

  if (existsSync(envPath)) {
    upsertEnvVar("NEXT_PUBLIC_ADMIN_EMAILS", email);
    console.log(`Updated .env.local → NEXT_PUBLIC_ADMIN_EMAILS=${email}`);
  }

  console.log("");
  console.log("Done. Next steps:");
  console.log("1. Add NEXT_PUBLIC_ADMIN_EMAILS to Vercel (same email) and redeploy production.");
  console.log("2. Restart local dev server if running.");
  console.log("3. Sign in at /admin/login (Staff link in footer).");
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
