import { GenesisProvider, FirstWinCelebration } from "@/components/genesis";
import { SquarePassAutomationProvider } from "@/components/square-pass/automation";
import PlayerAuthBootstrap from "@/components/player/PlayerAuthBootstrap";
import QuickUnlockGate from "@/components/player/QuickUnlockGate";
import PushNotificationPrompt from "@/components/player/PushNotificationPrompt";
import PlayerShell from "@/components/player/PlayerShell";
import { PlayerShellAvatarProvider } from "@/components/player/PlayerShellAvatarProvider";
import PlayerHomeNav from "@/components/home/PlayerHomeNav";
import { createClient } from "@/lib/supabase/server";
import { ensureEcosystemAccount } from "@/lib/platform/ecosystem/account";
import { getPlayerPublicIdentity } from "@/lib/player/publicIdentity";
import { publicProfilePath } from "@/lib/player/slug";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

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
    const [identity, account] = await Promise.all([
      getPlayerPublicIdentity(user.email).catch(() => null),
      ensureEcosystemAccount(user.email).catch(() => null),
    ]);
    avatarEmoji = identity?.avatarEmoji;
    if (account?.slug) {
      profileHref = publicProfilePath(account.slug);
    }
    followerCount = account?.followerCount ?? 0;
  }

  return (
    <PlayerShellAvatarProvider initialAvatarEmoji={avatarEmoji}>
      <PlayerShell
        userEmail={user?.email ?? undefined}
        avatarEmoji={avatarEmoji}
        profileHref={profileHref}
        followerCount={followerCount}
      >
        <PlayerAuthBootstrap />
        <PlayerHomeNav />
        <QuickUnlockGate>
          <GenesisProvider>
            <SquarePassAutomationProvider>
              {children}
              <FirstWinCelebration />
            </SquarePassAutomationProvider>
          </GenesisProvider>
        </QuickUnlockGate>
        <PushNotificationPrompt />
      </PlayerShell>
    </PlayerShellAvatarProvider>
  );
}
