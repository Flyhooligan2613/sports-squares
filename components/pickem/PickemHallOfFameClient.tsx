"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Trophy } from "lucide-react";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ExperienceHero from "@/components/ui/ExperienceHero";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import { PROFILE_LABELS } from "@/lib/platform/language";
import type { PickemSeasonArchive, PickemSeasonStanding, PickemSport } from "@/lib/pickem/types";
import { pickemApiUrl, pickemBasePath, pickemSportLabel } from "@/lib/pickem/routes";
import { pickemHallOfFameEmptyMessage, pickemHallOfFameSubtitle } from "@/lib/pickem/copy";

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function PickemHallOfFameClient({ sport = "nfl" }: { sport?: PickemSport }) {
  const basePath = pickemBasePath(sport);
  const sportLabel = pickemSportLabel(sport);
  const [seasons, setSeasons] = useState<PickemSeasonArchive[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [archive, setArchive] = useState<PickemSeasonArchive | null>(null);
  const [standings, setStandings] = useState<PickemSeasonStanding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeasons() {
      const res = await fetch(pickemApiUrl("hall-of-fame", sport), { cache: "no-store" });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { seasons: PickemSeasonArchive[] };
      setSeasons(data.seasons);
      if (data.seasons[0]) {
        setSelectedYear(data.seasons[0].seasonYear);
      }
      setLoading(false);
    }
    void loadSeasons();
  }, [sport]);

  useEffect(() => {
    if (selectedYear == null) return;
    async function loadDetail() {
      const res = await fetch(
        pickemApiUrl(`hall-of-fame?seasonYear=${selectedYear}`, sport),
        { cache: "no-store" }
      );
      if (!res.ok) {
        setArchive(null);
        setStandings([]);
        return;
      }
      const data = (await res.json()) as {
        archive: PickemSeasonArchive;
        standings: PickemSeasonStanding[];
      };
      setArchive(data.archive);
      setStandings(data.standings);
    }
    void loadDetail();
  }, [selectedYear, sport]);

  return (
    <div className="pickem-page min-h-screen relative">
      <AmbientBackground />
      <AppMenuBar logoHref={basePath} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <ExperienceHero
          badgeLabel="Legacy"
          badgeVariant="info"
          title={`${sportLabel} Pick'em Hall of Fame`}
          subtitle={pickemHallOfFameSubtitle(sport)}
        />

        {loading ? (
          <LandingGlassCard className="p-8">
            <BrandedLoadingLabel context="winners" className="text-center text-sb-muted" />
          </LandingGlassCard>
        ) : seasons.length === 0 ? (
          <LandingGlassCard className="p-8 text-center">
            <Trophy className="w-10 h-10 text-sb-muted mx-auto mb-3 opacity-60" />
            <p className="text-sb-muted text-sm">
              {pickemHallOfFameEmptyMessage(sport)}
            </p>
          </LandingGlassCard>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {seasons.map((s) => (
                <button
                  key={s.seasonYear}
                  type="button"
                  onClick={() => setSelectedYear(s.seasonYear)}
                  className={`pickem-filter-chip ${
                    selectedYear === s.seasonYear ? "pickem-filter-chip-active" : ""
                  }`}
                >
                  {s.seasonYear} Season
                </button>
              ))}
            </div>

            {archive ? (
              <>
                <LandingGlassCard className="p-6 sm:p-8 mb-6 border border-sb-gold/30 bg-sb-gold/5">
                  <p className="text-xs uppercase tracking-widest text-sb-gold mb-2">
                    {archive.seasonYear} Champion
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Crown className="w-8 h-8 text-sb-gold" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {archive.championDisplayName ?? "Champion"}
                      </p>
                      <p className="text-sb-muted text-sm">
                        Record {archive.championRecord} · {archive.championAccuracyPct}%
                        accuracy · {archive.championLongestStreak} best streak
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
                    <div>
                      <p className="text-sb-muted text-xs uppercase">Perfect Weeks</p>
                      <p className="text-white font-bold">{archive.championPerfectWeeks}</p>
                    </div>
                    <div>
                      <p className="text-sb-muted text-xs uppercase">Prize Won</p>
                      <p className="text-white font-bold">
                        {formatMoney(archive.championEarningsCents)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sb-muted text-xs uppercase">Players</p>
                      <p className="text-white font-bold">{archive.totalPlayers}</p>
                    </div>
                    <div>
                      <p className="text-sb-muted text-xs uppercase">Weeks</p>
                      <p className="text-white font-bold">{archive.totalWeeks}</p>
                    </div>
                  </div>
                </LandingGlassCard>

                <LandingGlassCard className="overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/10">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted">
                      Top 100 · Historical Standings
                    </h2>
                  </div>
                  <div className="divide-y divide-white/5 max-h-[480px] overflow-y-auto">
                    {standings.map((row) => (
                      <div
                        key={row.rank}
                        className="flex items-center gap-4 px-5 py-3 text-sm"
                      >
                        <span className="w-8 font-bold text-sb-muted">#{row.rank}</span>
                        <span className="flex-1 text-white font-medium truncate">
                          {row.displayName}
                        </span>
                        <span className="text-sb-muted tabular-nums">
                          {row.seasonWins}-{row.seasonLosses}
                        </span>
                        <span className="text-sb-muted tabular-nums hidden sm:inline">
                          {row.pickAccuracyPct}%
                        </span>
                        <span className="text-white font-semibold tabular-nums">
                          {row.lifetimePickemWins} 🏆
                        </span>
                      </div>
                    ))}
                  </div>
                </LandingGlassCard>
              </>
            ) : null}
          </>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={basePath} className="text-sm text-sb-muted hover:text-white">
            ← Pick&apos;em Home
          </Link>
          <Link href={`${basePath}/history`} className="text-sm text-sb-muted hover:text-white">
            {PROFILE_LABELS.competitionHistory}
          </Link>
        </div>
      </div>
    </div>
  );
}
