import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getAdminConfig } from "@/lib/platform/ecosystem/adminConfig";
import { ensureEcosystemAccount, updateEcosystemProfile } from "@/lib/platform/ecosystem/account";
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

  await updateEcosystemProfile(input.email, {
    username,
    username_changed_at: new Date().toISOString(),
    username_customized: true,
  });
}
