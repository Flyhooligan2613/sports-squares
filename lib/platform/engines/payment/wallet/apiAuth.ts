import { createClient } from "@/lib/supabase/server";
import { normalizeEmail } from "@/lib/player/statsCore";

export async function getSquareWalletAuthorizedEmail(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  return normalizeEmail(user.email);
}
