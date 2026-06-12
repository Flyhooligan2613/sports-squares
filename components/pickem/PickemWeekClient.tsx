"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ExperienceHero from "@/components/ui/ExperienceHero";
import { Button } from "@/components/ui/Button";
import PickemGameCard from "@/components/pickem/PickemGameCard";
import PickemEntryPanel from "@/components/pickem/PickemEntryPanel";
import PickemPoolList from "@/components/pickem/PickemPoolList";
import PickemMyPoolStatus from "@/components/pickem/PickemMyPoolStatus";
import PickemPlayerStatusBadge from "@/components/pickem/PickemPlayerStatusBadge";
import { PICKEM_CHAMPIONSHIP_BANNER } from "@/lib/pickem/copy";
import EntryTierSelector from "@/components/platform/EntryTierSelector";
import type { PickemMyPicksSummary, PickemSide, PickemWeekView } from "@/lib/pickem/types";
import { formatTierCents, parseEntryTierParam } from "@/lib/platform/core/entryTiers";

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

interface PickemWeekOption {
  id: string;
  label: string;
  weekNumber: number;
  seasonType: number;
  status: string;
  playerCount: number;
  isCurrent: boolean;
}

function WeekSelector({
  weeks,
  selectedId,
  onChange,
}: {
  weeks: PickemWeekOption[];
  selectedId: string;
  onChange: (contestId: string) => void;
}) {
  return (
    <LandingGlassCard className="p-4 mb-6">
      <label htmlFor="pickem-week-select" className="block text-xs uppercase tracking-wider text-sb-muted mb-2">
        Select NFL Week
      </label>
      <select
        id="pickem-week-select"
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      >
        {weeks.map((w) => (
          <option key={w.id} value={w.id} className="bg-sb-bg text-white">
            {w.label}
            {w.isCurrent ? " · Current" : ""}
            {w.status === "complete" ? " · Final" : w.status === "active" ? " · Live" : ""}
          </option>
        ))}
      </select>
    </LandingGlassCard>
  );
}

function MyPicksPanel({ summary }: { summary: PickemMyPicksSummary }) {
  const stats = [
    { label: "Weekly Record", value: summary.weeklyRecord },
    { label: "Season Record", value: summary.seasonRecord },
    { label: "Current Streak", value: summary.currentStreak, accent: true },
    { label: "Longest Streak", value: summary.longestStreak },
    {
      label: "Weekly Rank",
      value: summary.projectedWeeklyRank != null ? `#${summary.projectedWeeklyRank}` : "—",
    },
    {
      label: "Season Rank",
      value: summary.projectedSeasonRank != null ? `#${summary.projectedSeasonRank}` : "—",
    },
    { label: "Pick Accuracy", value: `${summary.pickAccuracyPct}%` },
    { label: "Lifetime Record", value: summary.lifetimeRecord },
    { label: "Perfect Weeks", value: summary.perfectWeeks },
    { label: "Weeks Played", value: summary.weeksPlayed },
  ];

  return (
    <LandingGlassCard className="p-5 mb-6 pickem-live-summary">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted">
          My Picks
        </h2>
        {summary.leagueLabel ? (
          <span className="text-xs font-medium text-emerald-400/90 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            {summary.leagueLabel}
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-xs uppercase tracking-wider text-sb-muted">{stat.label}</p>
            <p
              className={`text-xl sm:text-2xl font-bold ${
                stat.accent ? "text-emerald-400" : "text-white"
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </LandingGlassCard>
  );
}

export default function PickemWeekClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contestIdParam = searchParams.get("contestId");
  const entryTierCents = parseEntryTierParam(searchParams.get("tier"));
  const entrySessionId = searchParams.get("entry_session_id");

  const [week, setWeek] = useState<PickemWeekView | null>(null);
  const [weeks, setWeeks] = useState<PickemWeekOption[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [savingGameId, setSavingGameId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [entryPolling, setEntryPolling] = useState(false);
  const [entryCheckoutError, setEntryCheckoutError] = useState<string | null>(null);

  const loadWeeks = useCallback(async () => {
    const res = await fetch("/api/pickem/weeks", { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      weeks: PickemWeekOption[];
      currentContestId: string;
    };
    setWeeks(json.weeks);
    return json;
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const weeksData = weeks.length ? { currentContestId: selectedContestId, weeks } : await loadWeeks();
      const contestId =
        contestIdParam ??
        (selectedContestId || weeksData?.currentContestId || "");

      if (contestId && contestId !== selectedContestId) {
        setSelectedContestId(contestId);
      }

      const params = new URLSearchParams();
      if (contestId) params.set("contestId", contestId);
      params.set("tier", String(entryTierCents));
      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`/api/pickem/week${query}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load picks.");
      setWeek((await res.json()) as PickemWeekView);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed.");
    } finally {
      setLoading(false);
    }
  }, [contestIdParam, entryTierCents, loadWeeks, selectedContestId, weeks]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 60_000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!entrySessionId) return;

    let cancelled = false;
    let attempts = 0;
    setEntryPolling(true);

    async function pollEntry() {
      attempts += 1;
      const res = await fetch(
        `/api/pickem/entry/status?session_id=${encodeURIComponent(entrySessionId!)}`
      );
      const data = (await res.json()) as { status?: string };
      if (cancelled) return;

      if (data.status === "paid") {
        setEntryPolling(false);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("entry_session_id");
        router.replace(`/pickem/week?${params.toString()}`);
        await load();
        return;
      }

      if (attempts < 20) {
        setTimeout(() => void pollEntry(), 2000);
      } else {
        setEntryPolling(false);
      }
    }

    void pollEntry();
    return () => {
      cancelled = true;
    };
  }, [entrySessionId, load, router, searchParams]);

  function handleWeekChange(contestId: string) {
    setSelectedContestId(contestId);
    setLoading(true);
    router.push(
      `/pickem/week?contestId=${encodeURIComponent(contestId)}&tier=${entryTierCents}`
    );
  }

  function handleTierChange(cents: number) {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tier", String(cents));
    router.push(`/pickem/week?${params.toString()}`);
  }

  async function handleEntryCheckout() {
    if (!week) return;
    setCheckoutLoading(true);
    setEntryCheckoutError(null);

    try {
      const res = await fetch("/api/pickem/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contestId: week.contest.id,
          entryTierCents,
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (res.status === 401) {
        setAuthRequired(true);
        return;
      }

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout.");
      }

      window.location.href = data.url;
    } catch (err) {
      setEntryCheckoutError(err instanceof Error ? err.message : "Checkout failed.");
      setCheckoutLoading(false);
    }
  }

  async function handlePick(gameId: string, pickedSide: PickemSide) {
    if (!week || !week.entry.paid) return;
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
          entryTierCents,
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
            {weeks.length > 1 ? (
              <WeekSelector
                weeks={weeks}
                selectedId={week.contest.id}
                onChange={handleWeekChange}
              />
            ) : null}

            <LandingGlassCard className="p-4 sm:p-6 mb-6">
              <p className="text-xs uppercase tracking-wider text-sb-muted mb-3">
                Entry tier · {formatTierCents(entryTierCents)}
              </p>
              <EntryTierSelector
                selectedCents={entryTierCents}
                onSelect={(tier) => handleTierChange(tier.cents)}
              />
            </LandingGlassCard>

            {entryPolling ? (
              <LandingGlassCard className="p-4 mb-6 text-center text-sb-muted text-sm">
                Confirming your entry payment…
              </LandingGlassCard>
            ) : null}

            <PickemEntryPanel
              contestLabel={week.contest.label}
              entry={week.entry}
              loading={checkoutLoading}
              error={entryCheckoutError}
              onCheckout={handleEntryCheckout}
            />

            <PickemPoolList
              pools={week.pools}
              entryTierCents={entryTierCents}
              myPoolNumber={week.playerStatus?.poolNumber}
            />

            {week.playerStatus?.poolNumber
              ? (() => {
                  const myPool = week.pools.find(
                    (p) => p.poolNumber === week.playerStatus?.poolNumber
                  );
                  return myPool ? (
                    <PickemMyPoolStatus
                      pool={myPool}
                      entryTierCents={entryTierCents}
                      contestLabel={week.contest.label}
                    />
                  ) : null;
                })()
              : null}

            {week.playerStatus ? (
              <PickemPlayerStatusBadge status={week.playerStatus} />
            ) : null}

            {week.tiebreaker?.active ? (
              <LandingGlassCard className="p-4 mb-6 border border-amber-500/30 bg-amber-500/5">
                <p className="text-amber-300 text-sm font-semibold mb-2">
                  {PICKEM_CHAMPIONSHIP_BANNER}
                </p>
                <p className="text-sb-muted text-sm mb-3">
                  {week.tiebreaker.playersRemaining} players remain. Submit your SquareBoards
                  Championship Tiebreaker prediction before kickoff.
                </p>
                <Button
                  href={`/pickem/tiebreaker?contestId=${encodeURIComponent(week.contest.id)}&tier=${entryTierCents}`}
                >
                  Championship Tiebreaker
                </Button>
              </LandingGlassCard>
            ) : null}

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

            {week.myPicks ? <MyPicksPanel summary={week.myPicks} /> : null}

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
                  onPick={week.entry.paid ? handlePick : undefined}
                  disabled={!week.entry.paid}
                />
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/pickem/leaderboards" variant="secondary">
                View Leaderboards
              </Button>
              <Button href="/pickem/history" variant="secondary">
                My History
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
