import PlayerAuthBootstrap from "@/components/player/PlayerAuthBootstrap";
import QuickUnlockGate from "@/components/player/QuickUnlockGate";
import PlayerShell from "@/components/player/PlayerShell";
import { createClient } from "@/lib/supabase/server";
import { ensureEcosystemAccount } from "@/lib/platform/ecosystem/account";
import { getPlayerAvatar } from "@/lib/platform/ecosystem/progression";
import { publicProfilePath } from "@/lib/player/slug";
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
  let profileHref = "/my-games/profile";
  let followerCount = 0;
  if (user?.email && isSupabaseAdminConfigured()) {
    const [emoji, account] = await Promise.all([
      getPlayerAvatar(user.email).catch(() => undefined),
      ensureEcosystemAccount(user.email).catch(() => null),
    ]);
    avatarEmoji = emoji;
    if (account?.slug) {
      profileHref = publicProfilePath(account.slug);
    }
    followerCount = account?.followerCount ?? 0;
  }

  return (
    <PlayerShell
      userEmail={user?.email ?? undefined}
      avatarEmoji={avatarEmoji}
      profileHref={profileHref}
      followerCount={followerCount}
    >
      <PlayerAuthBootstrap />
      <QuickUnlockGate>{children}</QuickUnlockGate>
    </PlayerShell>
  );
}
