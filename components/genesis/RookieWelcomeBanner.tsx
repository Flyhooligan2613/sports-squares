"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { useGenesis } from "@/components/genesis/GenesisProvider";

export default function RookieWelcomeBanner() {
  const { progress, loading } = useGenesis();

  if (loading || !progress?.rookieSeason.active) return null;

  return (
    <LandingGlassCard
      glow
      className="p-5 sm:p-6 mb-8 border border-sb-purple/30 bg-gradient-to-br from-sb-purple/10 to-transparent admin-stat-enter"
    >
      <p className="text-[10px] uppercase tracking-[0.25em] text-sb-glow mb-2">Project Genesis™</p>
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Welcome to Rookie Season</h2>
      <p className="text-sm text-sb-muted max-w-2xl">
        Your first 30 days on SquareBoards — complete guided missions, earn XP and badges, and
        build your Competitor Card before your first championship moment.
      </p>
      {progress.rookieSeason.daysRemaining != null ? (
        <p className="text-xs text-sb-glow mt-3 tabular-nums">
          {progress.rookieSeason.daysRemaining} days left in Rookie Season
        </p>
      ) : null}
    </LandingGlassCard>
  );
}
