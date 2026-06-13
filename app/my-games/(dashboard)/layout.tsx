import PlayerAuthBootstrap from "@/components/player/PlayerAuthBootstrap";
import QuickUnlockGate from "@/components/player/QuickUnlockGate";
import PlayerShell from "@/components/player/PlayerShell";
import { createClient } from "@/lib/supabase/server";
import { getPlayerAvatar } from "@/lib/platform/ecosystem/progression";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export default async function MyGamesDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let avatarEmoji: string | undefined;
  if (user?.email && isSupabaseAdminConfigured()) {
    avatarEmoji = await getPlayerAvatar(user.email).catch(() => undefined);
  }

  return (
    <PlayerShell userEmail={user?.email ?? undefined} avatarEmoji={avatarEmoji}>
      <PlayerAuthBootstrap />
      <QuickUnlockGate>{children}</QuickUnlockGate>
    </PlayerShell>
  );
}
