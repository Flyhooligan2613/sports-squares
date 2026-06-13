import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getAdminConfig } from "@/lib/platform/ecosystem/adminConfig";
import { ensureEcosystemAccount, updateEcosystemProfile } from "@/lib/platform/ecosystem/account";
import { spendTierCredits } from "@/lib/platform/ecosystem/credits";

const RESERVED = new Set([
  "admin",
  "squareboards",
  "support",
  "official",
  "help",
  "security",
  "root",
  "system",
]);

export async function getUsernameChangeEligibility(email: string) {
  const account = await ensureEcosystemAccount(email);
  const config = await getAdminConfig("username");
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("username_changed_at")
    .eq("email", normalized)
    .maybeSingle();

  const changedAtMs = profile?.username_changed_at
    ? new Date(profile.username_changed_at as string).getTime()
    : null;
  const freeWindowMs = config.freeChangeDays * 24 * 60 * 60 * 1000;
  const now = Date.now();

  let requiresCredits = false;
  let daysUntilFreeChange = 0;

  if (changedAtMs) {
    const elapsed = now - changedAtMs;
    if (elapsed < freeWindowMs) {
      requiresCredits = true;
      daysUntilFreeChange = Math.ceil((freeWindowMs - elapsed) / (24 * 60 * 60 * 1000));
    }
  }

  return {
    username: account.username,
    playerId: account.playerId,
    requiresCredits,
    creditCost: config.paidChangeCredits,
    availableCredits: account.availableTierCredits,
    freeChangeDays: config.freeChangeDays,
    daysUntilFreeChange,
  };
}

export async function changeUsername(input: {
  email: string;
  username: string;
}): Promise<void> {
  const username = input.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (username.length < 3 || username.length > 20) {
    throw new Error("Username must be 3–20 characters (letters, numbers, underscore).");
  }
  if (RESERVED.has(username)) {
    throw new Error("This username is reserved.");
  }

  const account = await ensureEcosystemAccount(input.email);
  const config = await getAdminConfig("username");
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(input.email);

  const { data: conflict } = await supabase
    .from("player_profiles")
    .select("email")
    .ilike("username", username)
    .neq("email", normalized)
    .maybeSingle();

  if (conflict) throw new Error("Username is already taken.");

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("username_changed_at")
    .eq("email", normalized)
    .maybeSingle();

  const changedAtMs = profile?.username_changed_at
    ? new Date(profile.username_changed_at as string).getTime()
    : null;
  const freeWindowMs = config.freeChangeDays * 24 * 60 * 60 * 1000;
  const now = Date.now();

  if (changedAtMs) {
    const elapsed = now - changedAtMs;
    if (elapsed < freeWindowMs) {
      await spendTierCredits({
        email: input.email,
        amount: config.paidChangeCredits,
        source: "username_change",
      });
    }
  }

  if (account.username && account.username !== username) {
    await supabase.from("player_username_history").insert({
      email: normalized,
      username: account.username,
    });
  }

  await updateEcosystemProfile(input.email, {
    username,
    username_changed_at: new Date().toISOString(),
  });
}
