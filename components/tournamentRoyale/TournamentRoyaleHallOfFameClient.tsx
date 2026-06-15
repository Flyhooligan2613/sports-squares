"use client";

import { useEffect, useState } from "react";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AmbientBackground from "@/components/ui/AmbientBackground";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import { Button } from "@/components/ui/Button";
import { CONTEST_CTA_LABELS } from "@/lib/contestCenter/cta";
import { TOURNAMENT_ROYALE_PUBLIC_NAME } from "@/lib/tournamentRoyale/config";
import { tournamentRoyaleApiUrl, tournamentRoyalePath } from "@/lib/tournamentRoyale/routes";

interface HofEntry {
  id: string;
  displayName: string;
  category: string;
  seasonYear: number;
  detail: string | null;
}

export default function TournamentRoyaleHallOfFameClient() {
  const [entries, setEntries] = useState<HofEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(tournamentRoyaleApiUrl("hall-of-fame"))
      .then((r) => r.json())
      .then((data) => setEntries(data.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="tr-page min-h-screen relative overflow-x-hidden">
      <AmbientBackground className="tr-ambient-blue" fixed />
      <AppMenuBar logoHref={tournamentRoyalePath()} />

      <div className="relative z-10 px-4 pb-16 max-w-3xl mx-auto pt-12">
        <p className="text-xs uppercase tracking-wider text-blue-400/90 font-bold text-center">
          Permanent Legacy
        </p>
        <h1 className="text-3xl font-bold text-white text-center mt-2">
          {TOURNAMENT_ROYALE_PUBLIC_NAME} Hall of Fame
        </h1>
        <p className="text-sb-muted text-center mt-2 mb-8">
          Champions, Cinderella Kings, and Combo Legends — forever on SquareBoards.
        </p>

        {loading && <BrandedLoadingLabel context="tournament" className="text-center text-sb-muted" />}

        {!loading && entries.length === 0 && (
          <LandingGlassCard className="p-8 text-center">
            <p className="text-sb-muted">
              Hall of Fame inductees will appear here as tournaments complete.
            </p>
            <Button href={tournamentRoyalePath("hub")} className="mt-4">
              {CONTEST_CTA_LABELS["tournament-royale"]}
            </Button>
          </LandingGlassCard>
        )}

        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id}>
              <LandingGlassCard className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-bold text-white">{entry.displayName}</p>
                    <p className="text-sm text-blue-300 capitalize">
                      {entry.category.replace(/_/g, " ")}
                    </p>
                    {entry.detail && (
                      <p className="text-sm text-sb-muted mt-1">{entry.detail}</p>
                    )}
                  </div>
                  <span className="text-xs text-sb-muted">{entry.seasonYear}</span>
                </div>
              </LandingGlassCard>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
