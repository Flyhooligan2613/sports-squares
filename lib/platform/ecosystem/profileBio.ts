import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/database/config";
import { normalizeEmail } from "@/lib/player/statsCore";
import { ensureEcosystemAccount } from "@/lib/platform/ecosystem/account";
import { validateProfileBio } from "@/lib/platform/ecosystem/profanityFilter";

function isMissingProfileBioColumn(error: { code?: string; message?: string }): boolean {
  return (
    error.code === "42703" ||
    Boolean(error.message?.includes("profile_bio")) ||
    Boolean(error.message?.includes("schema cache"))
  );
}

export async function getProfileBio(email: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.playerProfiles)
    .select("profile_bio")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  if (error) {
    if (isMissingProfileBioColumn(error)) return null;
    throw error;
  }

  const bio = ((data?.profile_bio as string) ?? "").trim();
  return bio || null;
}

export async function setProfileBio(email: string, bio: string): Promise<string> {
  const result = validateProfileBio(bio);
  if (!result.ok) {
    throw new Error(result.reason ?? "Bio contains inappropriate language.");
  }

  const value = result.value ?? "";
  const normalized = normalizeEmail(email);
  const account = await ensureEcosystemAccount(normalized);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.playerProfiles)
    .upsert(
      {
        email: normalized,
        slug: account.slug,
        display_name: account.displayName,
        profile_bio: value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    )
    .select("profile_bio")
    .single();

  if (error) {
    if (isMissingProfileBioColumn(error)) {
      throw new Error(
        "Profile bio is not available yet — run migration 038_player_public_identity.sql in Supabase."
      );
    }
    throw error;
  }

  if (!data) {
    throw new Error("Could not save profile bio — player profile not found.");
  }

  const persisted = ((data.profile_bio as string) ?? "").trim();
  if (value && !persisted) {
    throw new Error("Bio did not save — confirm migration 038 is applied in Supabase.");
  }

  return persisted;
}
