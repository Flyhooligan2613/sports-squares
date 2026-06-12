"use client";

import { useEffect, useMemo, useState } from "react";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ExperienceHero from "@/components/ui/ExperienceHero";
import ExperiencePageSkeleton from "@/components/ui/ExperiencePageSkeleton";
import { Crown, Medal } from "lucide-react";
import type {
  PickemLeaderboardBoard,
  PickemLeaderboardPeriod,
  PickemLeaderboardScope,
  PickemLeaderboardSort,
} from "@/lib/pickem/types";

const SCOPES: PickemLeaderboardScope[] = [
  "worldwide",
  "united-states",
  "state",
  "friends",
];

const PERIODS: PickemLeaderboardPeriod[] = ["weekly", "season", "all-time"];

const SORTS: PickemLeaderboardSort[] = [
  "accuracy",
  "wins",
  "current-streak",
  "longest-streak",
];

function rankAccent(rank: number): string {
  if (rank === 1) return "text-sb-gold";
  if (rank === 2) return "text-slate-300";
  if (rank === 3) return "text-amber-700";
  return "text-sb-muted";
}

export default function PickemLeaderboardsClient() {
  const [scope, setScope] = useState<PickemLeaderboardScope>("worldwide");
  const [period, setPeriod] = useState<PickemLeaderboardPeriod>("season");
  const [sort, setSort] = useState<PickemLeaderboardSort>("accuracy");
  const [board, setBoard] = useState<PickemLeaderboardBoard | null>(null);
  const [loading, setLoading] = useState(true);

  const query = useMemo(
    () =>
      new URLSearchParams({
        scope,
        period,
        sort,
      }).toString(),
    [scope, period, sort]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const res = await fetch(`/api/pickem/leaderboards?${query}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed");
        const json = (await res.json()) as { board: PickemLeaderboardBoard };
        if (!cancelled) setBoard(json.board);
      } catch {
        if (!cancelled) setBoard(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="pickem-page min-h-screen relative">
      <AmbientBackground />
      <AppMenuBar logoHref="/pickem" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <ExperienceHero
          badgeLabel="Rankings"
          badgeVariant="info"
          badgePulse={false}
          title="Pick'em Leaderboards"
          subtitle="Weekly, season, and all-time rankings. Protect your streak."
        />

        <div className="flex flex-wrap gap-2 mb-4">
          {SCOPES.map((item) => (
            <button
              key={item}
              type="button"
              className={`pickem-filter-chip ${scope === item ? "pickem-filter-chip-active" : ""}`}
              onClick={() => setScope(item)}
              disabled={item === "state" || item === "friends"}
              title={
                item === "state" || item === "friends"
                  ? "Coming soon — profile graph required"
                  : undefined
              }
            >
              {item === "worldwide"
                ? "Worldwide"
                : item === "united-states"
                  ? "United States"
                  : item === "state"
                    ? "State"
                    : "Friends"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {PERIODS.map((item) => (
            <button
              key={item}
              type="button"
              className={`pickem-filter-chip ${period === item ? "pickem-filter-chip-active" : ""}`}
              onClick={() => setPeriod(item)}
            >
              {item === "all-time" ? "All-Time" : item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {SORTS.map((item) => (
            <button
              key={item}
              type="button"
              className={`pickem-filter-chip ${sort === item ? "pickem-filter-chip-active" : ""}`}
              onClick={() => setSort(item)}
            >
              {item === "accuracy"
                ? "Accuracy"
                : item === "wins"
                  ? "Wins"
                  : item === "current-streak"
                    ? "Current Streak"
                    : "Longest Streak"}
            </button>
          ))}
        </div>

        {loading ? <ExperiencePageSkeleton variant="live-winners" /> : null}

        {!loading && board ? (
          <>
            {board.viewerRank != null ? (
              <p className="text-center text-sm text-sb-glow mb-4">
                Your rank: #{board.viewerRank}
              </p>
            ) : null}

            <LandingGlassCard className="overflow-hidden">
              {!board.entries.length ? (
                <div className="p-10 text-center text-sb-muted text-sm">
                  No rankings yet — be the first to play this week.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {board.entries.map((entry) => (
                    <div
                      key={`${entry.rank}-${entry.email}`}
                      className={`lb-row flex items-center gap-4 px-4 sm:px-6 py-4 ${
                        entry.isViewer ? "lb-row-viewer" : ""
                      }`}
                    >
                      <div className="w-10 shrink-0 flex items-center justify-center gap-1">
                        {entry.rank === 1 ? (
                          <Crown className="w-4 h-4 text-sb-gold" />
                        ) : entry.rank <= 3 ? (
                          <Medal className={`w-4 h-4 ${rankAccent(entry.rank)}`} />
                        ) : null}
                        <span className={`text-sm font-bold tabular-nums ${rankAccent(entry.rank)}`}>
                          #{entry.rank}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white truncate">
                          {entry.displayName}
                          {entry.isViewer ? (
                            <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-sb-glow">
                              You
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-white tabular-nums shrink-0">
                        {entry.valueLabel}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </LandingGlassCard>
          </>
        ) : null}
      </div>
    </div>
  );
}
