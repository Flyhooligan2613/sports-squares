import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getAdminConfig } from "@/lib/platform/ecosystem/adminConfig";
import { ensureEcosystemAccount, updateEcosystemProfile, assignPlayerIdFromUsername } from "@/lib/platform/ecosystem/account";
import { spendTierCredits } from "@/lib/platform/ecosystem/credits";
import { validateUsername } from "@/lib/platform/ecosystem/profanityFilter";
import { getProfileBio } from "@/lib/platform/ecosystem/profileBio";

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
    .select("username_changed_at, username_customized, profile_bio")
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

  const bio = await getProfileBio(email);

  return {
    username: account.username,
    playerId: account.playerId,
    profileBio: bio,
    usernameCustomized: Boolean(profile?.username_customized),
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
  const validated = validateUsername(input.username);
  if (!validated.ok || !validated.value) {
    throw new Error(validated.reason ?? "Invalid username.");
  }

  const username = validated.value;
  const usernameKey = username.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (usernameKey.length >= 3 && RESERVED.has(usernameKey)) {
    throw new Error("This username is reserved.");
  }

  const account = await ensureEcosystemAccount(input.email);
  const config = await getAdminConfig("username");
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(input.email);

  const { data: profiles } = await supabase
    .from("player_profiles")
    .select("email, username")
    .neq("email", normalized);

  const conflict = (profiles ?? []).find(
    (row) => (row.username as string)?.trim().toLowerCase() === username.toLowerCase()
  );
  if (conflict) throw new Error("Username is already taken.");

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("username_changed_at, username")
    .eq("email", normalized)
    .maybeSingle();

  const changedAtMs = profile?.username_changed_at
    ? new Date(profile.username_changed_at as string).getTime()
    : null;
  const freeWindowMs = config.freeChangeDays * 24 * 60 * 60 * 1000;
  const now = Date.now();

  if (changedAtMs && profile?.username && profile.username !== username) {
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

  const usernameChanged = !profile?.username || profile.username !== username;
  const currentIdBase = (account.playerId ?? "").replace(/\d+$/, "");
  const usernameBase = username.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
  const playerIdOutOfSync = usernameBase.length >= 3 && currentIdBase !== usernameBase;

  const patch: Record<string, unknown> = {
    username,
    display_name: username,
    username_changed_at: new Date().toISOString(),
    username_customized: true,
  };

  if (usernameChanged || playerIdOutOfSync) {
    patch.player_id = await assignPlayerIdFromUsername(username);
  }

  await updateEcosystemProfile(input.email, patch);
}

/** Keep display_name and player_id aligned with the chosen username. */
export async function syncPublicIdentityFields(email: string): Promise<void> {
  const account = await ensureEcosystemAccount(email);
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("username_customized")
    .eq("email", normalized)
    .maybeSingle();

  const username = account.username?.trim();
  if (!username || !profile?.username_customized) return;

  const currentIdBase = (account.playerId ?? "").replace(/\d+$/, "");
  const usernameBase = username.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
  const playerIdOutOfSync = usernameBase.length >= 3 && currentIdBase !== usernameBase;

  const patch: Record<string, unknown> = {};
  if (account.displayName !== username) {
    patch.display_name = username;
  }
  if (playerIdOutOfSync) {
    patch.player_id = await assignPlayerIdFromUsername(username);
  }

  if (Object.keys(patch).length) {
    await updateEcosystemProfile(email, patch);
  }
}
