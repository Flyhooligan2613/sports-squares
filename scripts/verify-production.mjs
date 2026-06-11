/**
 * Smoke-test a deployed Sports Squares instance.
 *
 * Usage:
 *   node scripts/verify-production.mjs https://your-app.vercel.app
 */
const baseUrl = process.argv[2]?.replace(/\/$/, "");
if (!baseUrl) {
  console.error("Usage: node scripts/verify-production.mjs <APP_URL>");
  process.exit(1);
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const checks = [];

async function check(name, fn) {
  try {
    const result = await fn();
    checks.push({ name, ok: true, detail: result });
    console.log(`PASS  ${name}${result ? ` — ${result}` : ""}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    checks.push({ name, ok: false, detail: message });
    console.log(`FAIL  ${name} — ${message}`);
  }
}

await check("Homepage loads", async () => {
  const res = await fetch(baseUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return `HTTP ${res.status}`;
});

await check("Supabase public config exposed", async () => {
  const res = await fetch(`${baseUrl}/test-supabase`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  if (html.includes("Missing Supabase env")) throw new Error("Supabase env missing");
  return "page renders";
});

await check("ESPN scoreboard API", async () => {
  const res = await fetch(`${baseUrl}/api/espn/scoreboard?sport=nfl`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data?.events) && !data?.leagues) {
    throw new Error("Unexpected ESPN payload");
  }
  return `${data.events?.length ?? 0} events`;
});

await check("Invite resolve rejects invalid token", async () => {
  const res = await fetch(`${baseUrl}/api/invite/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inviteToken: "invalid-token-for-smoke-test" }),
  });
  if (res.status !== 404 && res.status !== 400) {
    throw new Error(`Expected 400/404, got ${res.status}`);
  }
  return `HTTP ${res.status}`;
});

await check("Stripe checkout config", async () => {
  const res = await fetch(`${baseUrl}/api/purchase/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      poolId: "nonexistent",
      name: "test",
      email: "test@example.com",
      squaresCount: 1,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 500 && String(data.error || "").includes("STRIPE")) {
    throw new Error("Stripe not configured");
  }
  return `HTTP ${res.status} (endpoint reachable)`;
});

const failed = checks.filter((c) => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
if (failed.length) process.exit(1);
