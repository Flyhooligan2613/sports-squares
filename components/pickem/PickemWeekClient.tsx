"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ExperienceHero from "@/components/ui/ExperienceHero";
import { Button } from "@/components/ui/Button";
import PickemGameCard from "@/components/pickem/PickemGameCard";
import type { PickemSide, PickemWeekView } from "@/lib/pickem/types";

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function PickemWeekClient() {
  const [week, setWeek] = useState<PickemWeekView | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingGameId, setSavingGameId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/pickem/week", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load picks.");
      setWeek((await res.json()) as PickemWeekView);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 60_000);
    return () => clearInterval(timer);
  }, [load]);

  async function handlePick(gameId: string, pickedSide: PickemSide) {
    if (!week) return;
    setSavingGameId(gameId);
    setAuthRequired(false);
    setError(null);

    try {
      const res = await fetch("/api/pickem/picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contestId: week.contest.id,
          gameId,
          pickedSide,
        }),
      });

      const json = (await res.json()) as { error?: string };
      if (res.status === 401) {
        setAuthRequired(true);
        return;
      }
      if (!res.ok) throw new Error(json.error ?? "Could not save pick.");

      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSavingGameId(null);
    }
  }

  const liveMode =
    week?.games.some((g) => g.status === "live" || g.status === "final") ?? false;

  return (
    <div className="pickem-page min-h-screen relative">
      <AmbientBackground />
      <AppMenuBar logoHref="/pickem" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {loading && !week ? (
          <LandingGlassCard className="p-10 text-center">
            <p className="text-sb-muted">Loading this week&apos;s slate…</p>
          </LandingGlassCard>
        ) : null}

        {error ? (
          <LandingGlassCard className="p-4 mb-6 border border-red-500/30">
            <p className="text-red-400 text-sm">{error}</p>
          </LandingGlassCard>
        ) : null}

        {authRequired ? (
          <LandingGlassCard className="p-4 mb-6 border border-emerald-500/30">
            <p className="text-emerald-200 text-sm mb-3">
              Sign in to save your picks. One account works across SquareBoards and Pick&apos;em.
            </p>
            <Button href="/my-games/login?next=/pickem/week">Sign in</Button>
          </LandingGlassCard>
        ) : null}

        {week ? (
          <>
            <ExperienceHero
              badgeLabel={week.contest.label}
              badgeVariant={liveMode ? "live" : "open"}
              title={`${week.contest.label} Picks`}
              subtitle="Tap the team you think wins. Picks save instantly and lock at kickoff."
              stats={[
                {
                  label: "Progress",
                  value: `${week.progress.completed}/${week.progress.total}`,
                },
                {
                  label: "Remaining",
                  value: week.progress.remaining,
                },
                {
                  label: "Prize Pool",
                  value: formatMoney(week.contest.prizePoolCents),
                },
                {
                  label: "Players",
                  value: week.contest.playerCount,
                },
              ]}
            />

            {week.liveSummary ? (
              <LandingGlassCard className="p-5 mb-6 pickem-live-summary">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-sb-muted">Weekly Record</p>
                    <p className="text-2xl font-bold text-white">{week.liveSummary.weeklyRecord}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-sb-muted">Current Streak</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {week.liveSummary.currentStreak}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-sb-muted">Weekly Rank</p>
                    <p className="text-2xl font-bold text-white">
                      {week.liveSummary.projectedWeeklyRank ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-sb-muted">Season Rank</p>
                    <p className="text-2xl font-bold text-white">
                      {week.liveSummary.projectedSeasonRank ?? "—"}
                    </p>
                  </div>
                </div>
              </LandingGlassCard>
            ) : null}

            <div className="mb-6">
              <div className="pickem-progress-track">
                <div
                  className="pickem-progress-bar"
                  style={{ width: `${week.progress.pct}%` }}
                />
              </div>
              <p className="text-sm text-sb-muted mt-2 text-center">
                {week.progress.completed} of {week.progress.total} picks complete ·{" "}
                {week.progress.remaining} remaining
              </p>
            </div>

            <div className="grid gap-4">
              {week.games.map((game) => (
                <PickemGameCard
                  key={game.id}
                  game={game}
                  saving={savingGameId === game.id}
                  onPick={handlePick}
                />
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/pickem/leaderboards" variant="secondary">
                View Leaderboards
              </Button>
              <Link href="/pickem" className="text-sm text-sb-muted hover:text-white">
                ← Pick&apos;em Home
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
