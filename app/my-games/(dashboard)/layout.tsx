import { GenesisProvider, FirstWinCelebration } from "@/components/genesis";
import { GenesisErrorBoundary } from "@/components/genesis/GenesisErrorBoundary";
import { SquareWalletWinExperience } from "@/components/square-wallet";
import { OnboardingQueueProvider } from "@/components/onboarding-queue";
import { ProviderErrorBoundary } from "@/components/ui/ProviderErrorBoundary";
import PlayerAuthBootstrap from "@/components/player/PlayerAuthBootstrap";
import QuickUnlockGate from "@/components/player/QuickUnlockGate";
import PushNotificationPrompt from "@/components/player/PushNotificationPrompt";
import PlayerShell from "@/components/player/PlayerShell";
import { PlayerShellAvatarProvider } from "@/components/player/PlayerShellAvatarProvider";
import PlayerHomeNav from "@/components/home/PlayerHomeNav";
import { createClient } from "@/lib/supabase/server";
import { ensureEcosystemAccount } from "@/lib/platform/ecosystem/account";
import { getPlayerLegacy } from "@/lib/database/services/playerLegacy";
import { ensurePlayerProfile } from "@/lib/database/services/playerProfiles";
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
  let publicProfileHref = "/my-games/profile";
  const competitorCardHref = "/my-games/profile";
  let followerCount = 0;
  if (user?.email && isSupabaseAdminConfigured()) {
    const [identity, account, legacy] = await Promise.all([
      getPlayerPublicIdentity(user.email).catch(() => null),
      ensureEcosystemAccount(user.email).catch(() => null),
      getPlayerLegacy(user.email).catch(() => null),
    ]);
    avatarEmoji = identity?.avatarEmoji;
    followerCount = account?.followerCount ?? 0;

    let slug = account?.slug ?? null;
    if (!slug && legacy) {
      slug =
        (await ensurePlayerProfile(user.email, legacy.publicLabel).catch(() => null)) ?? null;
    }
    if (slug) {
      publicProfileHref = publicProfilePath(slug);
    }
  }

  return (
    <PlayerShellAvatarProvider initialAvatarEmoji={avatarEmoji}>
      <PlayerShell
        userEmail={user?.email ?? undefined}
        avatarEmoji={avatarEmoji}
        publicProfileHref={publicProfileHref}
        competitorCardHref={competitorCardHref}
        followerCount={followerCount}
      >
        <PlayerAuthBootstrap />
        <PlayerHomeNav />
        <QuickUnlockGate>
          <GenesisProvider>
            <OnboardingQueueProvider>
              {children}
              <GenesisErrorBoundary name="GenesisFirstWin">
                <FirstWinCelebration />
              </GenesisErrorBoundary>
              <ProviderErrorBoundary name="SquareWalletWinExperience">
                <SquareWalletWinExperience />
              </ProviderErrorBoundary>
            </OnboardingQueueProvider>
          </GenesisProvider>
        </QuickUnlockGate>
        <PushNotificationPrompt />
      </PlayerShell>
    </PlayerShellAvatarProvider>
  );
}
