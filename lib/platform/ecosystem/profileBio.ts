import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { updateEcosystemProfile } from "@/lib/platform/ecosystem/account";
import { validateProfileBio } from "@/lib/platform/ecosystem/profanityFilter";

export async function getProfileBio(email: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("player_profiles")
    .select("profile_bio")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  const bio = ((data?.profile_bio as string) ?? "").trim();
  return bio || null;
}

export async function setProfileBio(email: string, bio: string): Promise<string> {
  const result = validateProfileBio(bio);
  if (!result.ok) {
    throw new Error(result.reason ?? "Bio contains inappropriate language.");
  }

  const value = result.value ?? "";
  await updateEcosystemProfile(email, { profile_bio: value });
  return value;
}
