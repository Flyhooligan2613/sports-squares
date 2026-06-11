import { createClient } from "@/lib/supabase/server";
import { isAuthorizedAdminEmail } from "./config";

export { isAuthorizedAdminEmail } from "./config";
export { ADMIN_EMAILS } from "./config";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

export async function getAuthorizedAdminUser() {
  const user = await getSessionUser();
  if (!user || !isAuthorizedAdminEmail(user.email)) return null;
  return user;
}
