import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { playerEmailHasPurchases } from "@/lib/auth/playerMagicLink";

/** True when this email may sign in (purchased boards or registered player account). */
export async function playerEmailCanSignIn(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);

  if (await playerEmailHasPurchases(normalized)) return true;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.playerProfiles)
    .select("email")
    .eq("email", normalized)
    .maybeSingle();

  if (error) {
    console.error("[playerEmailCanSignIn]", error.message);
    return false;
  }

  return Boolean(data?.email);
}
