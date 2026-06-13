import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";

export async function resolveLoginIdentifier(identifier: string): Promise<string | null> {
  const raw = identifier.trim();
  if (!raw) return null;

  const supabase = getSupabaseAdmin();

  if (raw.includes("@")) {
    return normalizeEmail(raw);
  }

  const phone = raw.replace(/\D/g, "");
  if (phone.length >= 10) {
    const { data } = await supabase
      .from("player_profiles")
      .select("email")
      .eq("phone", phone)
      .maybeSingle();
    if (data?.email) return normalizeEmail(data.email as string);
  }

  const upper = raw.toUpperCase();
  const { data: byPlayerId } = await supabase
    .from("player_profiles")
    .select("email")
    .eq("player_id", upper)
    .maybeSingle();
  if (byPlayerId?.email) return normalizeEmail(byPlayerId.email as string);

  const { data: byUsername } = await supabase
    .from("player_profiles")
    .select("email")
    .ilike("username", raw)
    .maybeSingle();
  if (byUsername?.email) return normalizeEmail(byUsername.email as string);

  return null;
}
