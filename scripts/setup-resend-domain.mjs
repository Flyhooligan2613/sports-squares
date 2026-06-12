/**
 * Add squareboards.pro to Resend, sync DNS at Porkbun, verify, update Vercel sender.
 *
 * Usage:
 *   node scripts/setup-resend-domain.mjs
 *
 * Requires in .env.local:
 *   RESEND_API_KEY (or NEXT_RESEND_KEY)
 *
 * Optional for automatic DNS at Porkbun:
 *   PORKBUN_API_KEY=pk1_...
 *   PORKBUN_SECRET_KEY=sk1_...
 *
 * Optional for Vercel sender update:
 *   VERCEL_TOKEN (from https://vercel.com/account/tokens)
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const DOMAIN = "squareboards.pro";
const FROM_EMAIL = `SquareBoards <noreply@${DOMAIN}>`;

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

const env = { ...loadEnvLocal(), ...process.env };
const resendKey = env.RESEND_API_KEY?.trim() || env.NEXT_RESEND_KEY?.trim();

if (!resendKey) {
  console.error("Missing RESEND_API_KEY or NEXT_RESEND_KEY in .env.local");
  process.exit(1);
}

async function resendFetch(path, options = {}) {
  const response = await fetch(`https://api.resend.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message ?? body.error ?? `Resend HTTP ${response.status}`);
  }
  return body;
}

function recordHost(name) {
  if (!name || name === DOMAIN || name === "@") return "";
  return name.replace(`.${DOMAIN}`, "").replace(/\.$/, "");
}

async function porkbunFetch(path, payload) {
  const response = await fetch(`https://api.porkbun.com/api/json/v3${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: env.PORKBUN_API_KEY,
      secretapikey: env.PORKBUN_SECRET_KEY,
      ...payload,
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (body.status !== "SUCCESS") {
    throw new Error(body.message ?? `Porkbun HTTP ${response.status}`);
  }
  return body;
}

async function upsertPorkbunRecord(existing, record) {
  const name = recordHost(record.name);
  const match = existing.find(
    (row) =>
      row.type === record.type &&
      row.name.replace(`.${DOMAIN}`, "") === (name || "") &&
      row.content === record.value
  );
  if (match) {
    console.log(`  skip ${record.type} ${name || "@"} (already set)`);
    return;
  }

  const conflicting = existing.filter(
    (row) =>
      row.type === record.type &&
      row.name.replace(`.${DOMAIN}`, "") === (name || "")
  );

  for (const row of conflicting) {
    console.log(`  delete old ${row.type} ${row.name} (${row.id})`);
    await porkbunFetch(`/dns/delete/${DOMAIN}/${row.id}`, {});
  }

  console.log(`  create ${record.type} ${name || "@"}`);
  await porkbunFetch(`/dns/create/${DOMAIN}`, {
    name,
    type: record.type,
    content: record.value,
    ttl: record.ttl ? String(record.ttl) : "600",
  });
}

async function syncPorkbunDns(records) {
  if (!env.PORKBUN_API_KEY || !env.PORKBUN_SECRET_KEY) {
    console.log("");
    console.log("Porkbun API keys not found — add DNS manually:");
    for (const record of records) {
      console.log(
        `  ${record.type} ${record.name} -> ${record.value}${record.priority != null ? ` (priority ${record.priority})` : ""}`
      );
    }
    console.log("");
    console.log("Enable API access at Porkbun → Domain Management → squareboards.pro → Details.");
    console.log("Then add PORKBUN_API_KEY and PORKBUN_SECRET_KEY to .env.local and re-run.");
    return false;
  }

  console.log("Syncing DNS records at Porkbun...");
  const existing = (await porkbunFetch(`/dns/retrieve/${DOMAIN}`, {})).records ?? [];

  for (const record of records) {
    if (record.record === "Tracking" || record.record === "TrackingCAA") continue;
    await upsertPorkbunRecord(existing, record);
  }

  return true;
}

async function waitForVerification(domainId, attempts = 12) {
  for (let i = 1; i <= attempts; i += 1) {
    await resendFetch(`/domains/${domainId}/verify`, { method: "POST" });
    const domain = await resendFetch(`/domains/${domainId}`);
    const status = domain.status ?? domain.data?.status;
    console.log(`  verify attempt ${i}/${attempts}: ${status}`);

    if (status === "verified") return true;
    if (i < attempts) await new Promise((r) => setTimeout(r, 15000));
  }
  return false;
}

function updateVercelFromEmail() {
  if (!env.VERCEL_TOKEN) {
    console.log("");
    console.log(`Set Vercel RESEND_FROM_EMAIL manually to: ${FROM_EMAIL}`);
    return false;
  }

  const vercelBin = join(root, "node_modules", "vercel", "dist", "index.js");
  console.log(`Updating Vercel RESEND_FROM_EMAIL -> ${FROM_EMAIL}`);
  const result = spawnSync(process.execPath, [vercelBin, "env", "add", "RESEND_FROM_EMAIL", "production", "--force"], {
    cwd: root,
    input: `${FROM_EMAIL}\n`,
    env: { ...process.env, VERCEL_TOKEN: env.VERCEL_TOKEN },
    stdio: ["pipe", "inherit", "inherit"],
  });

  if (result.status !== 0) {
    console.error("Failed to update Vercel env.");
    return false;
  }

  console.log("Redeploying production...");
  const deploy = spawnSync(
    process.execPath,
    [vercelBin, "deploy", "--prod", "--yes", "--token", env.VERCEL_TOKEN],
    { cwd: root, stdio: "inherit", env: { ...process.env, VERCEL_TOKEN: env.VERCEL_TOKEN } }
  );
  return deploy.status === 0;
}

async function main() {
  console.log(`Resend domain setup: ${DOMAIN}`);

  const list = await resendFetch("/domains");
  const domains = list.data ?? list ?? [];
  let domain = domains.find((d) => d.name === DOMAIN);

  if (!domain) {
    console.log("Creating domain in Resend...");
    const created = await resendFetch("/domains", {
      method: "POST",
      body: JSON.stringify({ name: DOMAIN }),
    });
    domain = created;
  } else {
    console.log(`Domain already in Resend (${domain.id}, status: ${domain.status})`);
  }

  const domainId = domain.id;
  const detail = await resendFetch(`/domains/${domainId}`);
  const records = detail.records ?? [];

  if (!records.length) {
    console.error("No DNS records returned from Resend.");
    process.exit(1);
  }

  const dnsSynced = await syncPorkbunDns(records);
  if (!dnsSynced) process.exit(0);

  console.log("Waiting for DNS propagation, then verifying...");
  const verified = await waitForVerification(domainId);

  if (!verified) {
    console.log("");
    console.log("Domain not verified yet. DNS can take up to an hour.");
    console.log("Re-run: node scripts/setup-resend-domain.mjs");
    process.exit(0);
  }

  console.log("");
  console.log("Domain verified in Resend.");
  updateVercelFromEmail();
  console.log("");
  console.log("Done. Magic-link emails will send from", FROM_EMAIL);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
