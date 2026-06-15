"use client";

import { useEffect, useState } from "react";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ExperienceHero from "@/components/ui/ExperienceHero";
import ExperiencePageSkeleton from "@/components/ui/ExperiencePageSkeleton";
import { Button } from "@/components/ui/Button";
import type {
  LeaderboardBoard,
  LeaderboardTab,
  LeaderboardsData,
} from "@/lib/player/leaderboardTypes";
import {
  COMMUNITY_LABELS,
  CONTEST_CTAS,
  EMPTY_STATE,
  PLAYER_TERMS,
} from "@/lib/platform/language";
import { Crown, Medal, Trophy, Users } from "lucide-react";

const TAB_ORDER: LeaderboardTab[] = [
  "all-time-winnings",
  "all-time-wins",
  "weekly-wins",
  "streak-leaders",
];

function rankAccent(rank: number): string {
  if (rank === 1) return "text-sb-gold";
  if (rank === 2) return "text-slate-300";
  if (rank === 3) return "text-amber-700";
  return "text-sb-muted";
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-4 h-4 text-sb-gold" />;
  if (rank <= 3) return <Medal className={`w-4 h-4 ${rankAccent(rank)}`} />;
  return null;
}

function LeaderboardTable({ board }: { board: LeaderboardBoard }) {
  if (!board.entries.length) {
    return (
      <LandingGlassCard className="p-10 text-center">
        <p className="text-white font-semibold mb-2">{EMPTY_STATE.noRankings.title}</p>
        <p className="text-sb-muted text-sm mb-6">
          {EMPTY_STATE.noRankings.body}
        </p>
        <Button href="/games/nfl">{EMPTY_STATE.noRankings.cta}</Button>
      </LandingGlassCard>
    );
  }

  return (
    <LandingGlassCard className="overflow-hidden">
      <div className="divide-y divide-white/5">
        {board.entries.map((entry) => (
          <div
            key={`${board.id}-${entry.rank}-${entry.displayName}`}
            className={`lb-row flex items-center gap-4 px-4 sm:px-6 py-4 ${
              entry.isViewer ? "lb-row-viewer" : ""
            }`}
          >
            <div className="w-10 shrink-0 flex items-center justify-center gap-1">
              <RankIcon rank={entry.rank} />
              <span className={`text-sm font-bold tabular-nums ${rankAccent(entry.rank)}`}>
                #{entry.rank}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white truncate">
                {entry.displayName}
                {entry.isViewer && (
                  <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-sb-glow">
                    {PLAYER_TERMS.you}
                  </span>
                )}
              </p>
            </div>
            <p className="text-sm sm:text-base font-bold text-white tabular-nums shrink-0">
              {entry.valueLabel}
            </p>
          </div>
        ))}
      </div>
    </LandingGlassCard>
  );
}

export default function LeaderboardsCenter() {
  const [data, setData] = useState<LeaderboardsData | null>(null);
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("all-time-winnings");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/leaderboards", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load");
        const json = (await res.json()) as LeaderboardsData;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError(`Could not load ${COMMUNITY_LABELS.competitionRankings.toLowerCase()}.`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeBoard = data?.boards.find((b) => b.id === activeTab);

  return (
    <div className="lb-page min-h-screen flex flex-col">
      <AppMenuBar />
      <main className="flex-1 relative overflow-hidden">
        <AmbientBackground />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <ExperienceHero
            badgeLabel="Global Competition"
            title={COMMUNITY_LABELS.competitionRankings}
            subtitle={`See where you rank worldwide — winnings, wins, weekly heat, and streaks.`}
          />

          {loading ? (
            <ExperiencePageSkeleton variant="live-winners" />
          ) : error || !data ? (
            <LandingGlassCard className="p-8 text-center mt-8">
              <p className="text-sb-muted">{error ?? COMMUNITY_LABELS.rankingsUnavailable}</p>
            </LandingGlassCard>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 mt-8 mb-6">
                <span className="inline-flex items-center gap-2 text-xs text-sb-muted bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {data.totalPlayers.toLocaleString()} {PLAYER_TERMS.competitors.toLowerCase()} ranked
                </span>
                {activeBoard?.viewerRank && (
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-sb-glow bg-sb-purple/15 border border-sb-purple/30 rounded-full px-3 py-1.5">
                    Your rank: #{activeBoard.viewerRank}
                  </span>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
                {TAB_ORDER.map((tab) => {
                  const board = data.boards.find((b) => b.id === tab);
                  if (!board) return null;
                  const active = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        active
                          ? "bg-sb-purple text-white shadow-lg shadow-sb-purple/25"
                          : "bg-white/5 text-sb-muted hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {board.title}
                    </button>
                  );
                })}
              </div>

              {activeBoard && (
                <>
                  <p className="text-sb-muted text-sm mb-4">{activeBoard.subtitle}</p>
                  <LeaderboardTable board={activeBoard} />
                </>
              )}

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button href="/games/nfl">{CONTEST_CTAS.competeNow}</Button>
                <Button href="/my-games/profile" variant="ghost">
                  View Your Legacy
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
