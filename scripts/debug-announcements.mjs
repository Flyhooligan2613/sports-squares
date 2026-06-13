/**
 * Debug announcement delivery — scheduled rows, live filter, dismissals.
 * Usage: npm run announcements:debug
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

function loadEnvLocal() {
  if (!existsSync(envPath)) return {};
  const out = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
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
    out[trimmed.slice(0, eq).trim()] = value;
  }
  return out;
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
};

async function rest(path) {
  const res = await fetch(`${url}/rest/v1/${path}`, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

const now = new Date();
const iso = encodeURIComponent(now.toISOString());

console.log("Now:", now.toISOString());

const all = await rest(
  "platform_announcements?select=id,title,display_type,audience,active,starts_at,ends_at,frequency,source&order=priority.desc"
);

console.log("\nAll announcements:", all.length);
for (const row of all) {
  const starts = new Date(row.starts_at);
  const ends = row.ends_at ? new Date(row.ends_at) : null;
  const live =
    row.active &&
    starts.getTime() <= now.getTime() &&
    (!ends || ends.getTime() >= now.getTime());
  console.log({
    title: row.title,
    display_type: row.display_type,
    audience: row.audience,
    active: row.active,
    live,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    frequency: row.frequency,
    source: row.source,
  });
}

const scheduled = await rest(
  `platform_announcements?select=display_type,title,audience,starts_at,ends_at&active=eq.true&starts_at=lte.${iso}`
);

const liveRows = scheduled.filter((row) => {
  if (!row.ends_at) return true;
  return new Date(row.ends_at).getTime() >= now.getTime();
});

console.log("\nScheduled (active + started + not ended):", liveRows.length);
for (const row of liveRows) {
  console.log(" -", row.display_type, "|", row.title, "| audience:", row.audience);
}

const dismissRes = await fetch(
  `${url}/rest/v1/platform_announcement_dismissals?select=id`,
  { headers: { ...headers, Prefer: "count=exact" } }
);
const range = dismissRes.headers.get("content-range");
const total = range?.split("/")?.[1] ?? "?";
console.log("\nTotal dismissals:", total);
