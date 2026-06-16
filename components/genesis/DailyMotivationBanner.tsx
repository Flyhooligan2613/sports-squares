"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { useGenesis } from "@/components/genesis/GenesisProvider";

export default function DailyMotivationBanner() {
  const { progress, loading } = useGenesis();

  if (loading || !progress?.rookieSeason.active) return null;

  return (
    <LandingGlassCard className="p-4 sm:p-5 border border-white/10 bg-white/[0.02]">
      <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">Daily Motivation</p>
      <p className="text-sm text-white/90 italic">&ldquo;{progress.motivation}&rdquo;</p>
    </LandingGlassCard>
  );
}
