import type { Metadata } from "next";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import RecentWinsTimeline from "@/components/player/RecentWinsTimeline";
import { getPlayerDashboard } from "@/lib/database/services/playerDashboard";
import { createClient } from "@/lib/supabase/server";
import { BRAND_NAME } from "@/lib/brand";
import { PLATFORM_TERMS } from "@/lib/platform/legacy/competitiveLanguage";

export const metadata: Metadata = {
  title: `${PLATFORM_TERMS.competitionHistory} | ${BRAND_NAME}`,
  description: "Your competition history and payout timeline.",
};

export default async function MyGamesHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dashboard = user?.email
    ? await getPlayerDashboard(user.email).catch(() => null)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
        {PLATFORM_TERMS.competitionHistory}
      </h1>
      <p className="text-sb-muted mb-8">
        Every contest result and payout — in one timeline.
      </p>

      {dashboard ? (
        <RecentWinsTimeline wins={dashboard.recentWins} />
      ) : (
        <LandingGlassCard className="p-8 text-center">
          <p className="text-sb-muted text-sm">Unable to load history.</p>
        </LandingGlassCard>
      )}
    </div>
  );
}
