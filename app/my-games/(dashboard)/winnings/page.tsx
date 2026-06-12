import type { Metadata } from "next";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import RecentWinsTimeline from "@/components/player/RecentWinsTimeline";
import { getPlayerDashboard } from "@/lib/database/services/playerDashboard";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/purchases/successSummary";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `My Winnings | ${BRAND_NAME}`,
};

export default async function MyWinningsPage() {
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
        My Winnings
      </h1>
      <p className="text-sb-muted mb-8">Every quarter win and payout in one place.</p>

      {dashboard ? (
        <>
          <LandingGlassCard glow className="p-6 mb-6 text-center">
            <p className="text-xs uppercase tracking-wider text-sb-muted mb-2">Total Winnings</p>
            <p className="text-4xl font-bold text-sb-gold tabular-nums">
              {formatCurrency(dashboard.stats.totalWinnings)}
            </p>
            <p className="text-sm text-sb-muted mt-2">
              {dashboard.stats.lifetimeWins} lifetime win
              {dashboard.stats.lifetimeWins === 1 ? "" : "s"}
            </p>
          </LandingGlassCard>
          <RecentWinsTimeline wins={dashboard.recentWins} />
        </>
      ) : (
        <LandingGlassCard className="p-8 text-center">
          <p className="text-sb-muted text-sm">Unable to load winnings.</p>
        </LandingGlassCard>
      )}
    </div>
  );
}
