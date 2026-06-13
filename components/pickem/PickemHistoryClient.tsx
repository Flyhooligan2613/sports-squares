"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AmbientBackground from "@/components/ui/AmbientBackground";
import { Button } from "@/components/ui/Button";
import type { PickemWeekHistoryEntry, PickemSport } from "@/lib/pickem/types";
import { pickemApiUrl, pickemBasePath } from "@/lib/pickem/routes";
import { pickemTiebreakerHistoryLabel } from "@/lib/pickem/copy";

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

interface HistorySummary {
  seasonRecord: string;
  bestFinish: number | null;
  perfectWeeks: number;
  mondayTiebreakerWins: number;
  longestWinStreak: number;
  lifetimePickemWins: number;
  lifetimeEarningsCents: number;
  globalRank: number | null;
  countryRank: number | null;
  stateRank: number | null;
  memberSince: string | null;
  weeks: PickemWeekHistoryEntry[];
}

function formatMemberSince(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default function PickemHistoryClient({ sport = "nfl" }: { sport?: PickemSport }) {
  const basePath = pickemBasePath(sport);
  const [data, setData] = useState<HistorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(pickemApiUrl("history", sport), { cache: "no-store" });
        if (res.status === 401) {
          setError("Sign in to view your Pick'em history.");
          return;
        }
        if (!res.ok) throw new Error("Failed to load history.");
        setData((await res.json()) as HistorySummary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Load failed.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [sport]);

  const stats = data
    ? [
        { label: "Season Record", value: data.seasonRecord },
        {
          label: "Global Rank",
          value: data.globalRank != null ? `#${data.globalRank}` : "—",
        },
        {
          label: "Country Rank",
          value: data.countryRank != null ? `#${data.countryRank}` : "—",
        },
        {
          label: "Best Finish",
          value: data.bestFinish != null ? `#${data.bestFinish}` : "—",
        },
        { label: "Perfect Weeks", value: data.perfectWeeks },
        { label: "Championship Tiebreaker Wins", value: data.mondayTiebreakerWins },
        { label: "Longest Win Streak", value: data.longestWinStreak },
        { label: "Lifetime Pick'em Wins", value: data.lifetimePickemWins },
        {
          label: "Lifetime Earnings",
          value: formatMoney(data.lifetimeEarningsCents),
        },
        { label: "Member Since", value: formatMemberSince(data.memberSince) },
      ]
    : [];

  return (
    <div className="pickem-page min-h-screen relative">
      <AmbientBackground />
      <AppMenuBar logoHref={basePath} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <LandingGlassCard className="p-6 sm:p-8 mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Pick&apos;em History</h1>
          <p className="text-sb-muted text-sm">
            Every week saved permanently — records, finishes, and earnings.
          </p>
        </LandingGlassCard>

        {loading ? (
          <LandingGlassCard className="p-8 text-center text-sb-muted">Loading…</LandingGlassCard>
        ) : null}

        {error ? (
          <LandingGlassCard className="p-5 mb-6 border border-emerald-500/30">
            <p className="text-emerald-200 text-sm mb-3">{error}</p>
            <Button href={`/my-games/login?next=${encodeURIComponent(`${basePath}/history`)}`}>Sign in</Button>
          </LandingGlassCard>
        ) : null}

        {data ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {stats.map((stat) => (
                <LandingGlassCard key={stat.label} className="p-4 text-center">
                  <p className="text-xs uppercase text-sb-muted">{stat.label}</p>
                  <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
                </LandingGlassCard>
              ))}
            </div>

            <LandingGlassCard className="p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
                Weekly results
              </h2>
              {data.weeks.length === 0 ? (
                <p className="text-sb-muted text-sm">No completed weeks yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.weeks.map((week) => (
                    <div
                      key={week.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div>
                        <p className="text-white font-medium">{week.weekLabel}</p>
                        <p className="text-xs text-sb-muted">
                          Pool #{week.poolNumber} · {week.weeklyRecord}
                          {week.tiebreakerUsed
                            ? ` · ${pickemTiebreakerHistoryLabel(sport)}`
                            : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white capitalize">
                          {week.status.replace("_", " ")}
                        </p>
                        {week.earningsCents > 0 ? (
                          <p className="text-xs text-emerald-400">
                            {formatMoney(week.earningsCents)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </LandingGlassCard>

            <div className="mt-8 text-center">
              <Link href={basePath} className="text-sm text-sb-muted hover:text-white">
                ← Pick&apos;em Home
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
