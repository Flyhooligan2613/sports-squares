"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AmbientBackground from "@/components/ui/AmbientBackground";
import { Button } from "@/components/ui/Button";
import PickemPlayerStatusBadge from "@/components/pickem/PickemPlayerStatusBadge";
import type { PickemGame, PickemPlayerPoolStatus } from "@/lib/pickem/types";
import {
  PICKEM_CHAMPIONSHIP_BANNER,
  PICKEM_CHAMPIONSHIP_CONGRATS,
  PICKEM_CHAMPIONSHIP_TIEBREAKER_SUBTITLE,
  PICKEM_CHAMPIONSHIP_TIEBREAKER_TITLE,
} from "@/lib/pickem/copy";
import { formatTierCents, parseEntryTierParam } from "@/lib/platform/core/entryTiers";

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatKickoff(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
}

function Countdown({ targetIso }: { targetIso: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    function tick() {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Kickoff — predictions locked");
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setRemaining(`${h}h ${m}m ${s}s`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return <span className="font-mono text-emerald-300">{remaining}</span>;
}

interface TiebreakerPayload {
  contest: { id: string; label: string };
  mondayGame: PickemGame | null;
  tiebreaker: { id: string; status: string; actualTotalPoints: number | null } | null;
  playerStatus: { status: string; sundayRecord: string } | null;
  myEntry: { predictedTotal: number | null; lockedAt: string | null } | null;
  league: { prizePoolCents: number; leagueNumber: number } | null;
  tiedPlayers: number;
  playersRemaining: number;
}

export default function PickemTiebreakerClient() {
  const searchParams = useSearchParams();
  const contestId = searchParams.get("contestId");
  const entryTierCents = parseEntryTierParam(searchParams.get("tier"));

  const [data, setData] = useState<TiebreakerPayload | null>(null);
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!contestId) return;
    setError(null);
    try {
      const params = new URLSearchParams({ contestId, tier: String(entryTierCents) });
      const res = await fetch(`/api/pickem/tiebreaker?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load tiebreaker.");
      setData((await res.json()) as TiebreakerPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed.");
    } finally {
      setLoading(false);
    }
  }, [contestId, entryTierCents]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 30_000);
    return () => clearInterval(timer);
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.tiebreaker) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/pickem/tiebreaker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tiebreakerId: data.tiebreaker.id,
          predictedTotal: Number(prediction),
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Could not save.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  const playerStatus: PickemPlayerPoolStatus | null = data?.playerStatus
    ? {
        status: data.playerStatus.status as PickemPlayerPoolStatus["status"],
        sundayRecord: data.playerStatus.sundayRecord,
        poolNumber: data.league?.leagueNumber ?? null,
        poolLabel: data.league ? `Pool #${data.league.leagueNumber}` : null,
        finishPlace: null,
        payoutCents: data.league?.prizePoolCents ?? null,
      }
    : null;

  const locked =
    data?.tiebreaker?.status === "locked" ||
    data?.tiebreaker?.status === "complete" ||
    data?.tiebreaker?.status === "split" ||
    (data?.mondayGame &&
      new Date(data.mondayGame.kickoffAt).getTime() <= Date.now());

  return (
    <div className="pickem-page min-h-screen relative">
      <AmbientBackground />
      <AppMenuBar logoHref="/pickem" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <LandingGlassCard className="p-6 sm:p-8 mb-6 text-center border border-amber-500/30 bg-amber-500/5 pickem-championship-banner">
          <p className="text-xs uppercase tracking-widest text-amber-400 mb-2">
            {PICKEM_CHAMPIONSHIP_BANNER}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {PICKEM_CHAMPIONSHIP_TIEBREAKER_TITLE}
          </h1>
          <p className="text-sb-muted text-sm max-w-lg mx-auto">
            {PICKEM_CHAMPIONSHIP_TIEBREAKER_SUBTITLE}
          </p>
        </LandingGlassCard>

        {loading ? (
          <LandingGlassCard className="p-8 text-center text-sb-muted">
            Loading tiebreaker…
          </LandingGlassCard>
        ) : null}

        {error ? (
          <LandingGlassCard className="p-4 mb-6 border border-red-500/30">
            <p className="text-red-400 text-sm">{error}</p>
          </LandingGlassCard>
        ) : null}

        {data ? (
          <>
            {playerStatus ? <PickemPlayerStatusBadge status={playerStatus} /> : null}

            {data.playerStatus?.status === "tiebreaker" ? (
              <LandingGlassCard className="p-5 mb-6 border border-amber-500/20 bg-amber-500/5">
                <p className="text-sm text-white leading-relaxed">{PICKEM_CHAMPIONSHIP_CONGRATS}</p>
              </LandingGlassCard>
            ) : null}

            {data.mondayGame ? (
              <LandingGlassCard className="p-5 sm:p-6 mb-6">
                <p className="text-xs uppercase tracking-wider text-sb-muted mb-4">
                  Monday Night matchup
                </p>
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="text-center">
                    {data.mondayGame.awayLogoUrl ? (
                      <Image
                        src={data.mondayGame.awayLogoUrl}
                        alt=""
                        width={56}
                        height={56}
                        className="mx-auto mb-2"
                      />
                    ) : null}
                    <p className="text-white font-semibold">{data.mondayGame.awayTeam}</p>
                  </div>
                  <span className="text-sb-muted text-lg">@</span>
                  <div className="text-center">
                    {data.mondayGame.homeLogoUrl ? (
                      <Image
                        src={data.mondayGame.homeLogoUrl}
                        alt=""
                        width={56}
                        height={56}
                        className="mx-auto mb-2"
                      />
                    ) : null}
                    <p className="text-white font-semibold">{data.mondayGame.homeTeam}</p>
                  </div>
                </div>
                <p className="text-center text-sm text-sb-muted">
                  Kickoff: {formatKickoff(data.mondayGame.kickoffAt)}
                </p>
                <p className="text-center mt-3 text-sm">
                  Locks in:{" "}
                  {data.mondayGame.kickoffAt ? (
                    <Countdown targetIso={data.mondayGame.kickoffAt} />
                  ) : (
                    "—"
                  )}
                </p>
              </LandingGlassCard>
            ) : null}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <LandingGlassCard className="p-4 text-center">
                <p className="text-xs text-sb-muted uppercase">Players remaining</p>
                <p className="text-2xl font-bold text-white">{data.tiedPlayers}</p>
              </LandingGlassCard>
              <LandingGlassCard className="p-4 text-center">
                <p className="text-xs text-sb-muted uppercase">Prize pool</p>
                <p className="text-2xl font-bold text-white">
                  {formatMoney(data.league?.prizePoolCents ?? 0)}
                </p>
              </LandingGlassCard>
              <LandingGlassCard className="p-4 text-center col-span-2 sm:col-span-1">
                <p className="text-xs text-sb-muted uppercase">Tier</p>
                <p className="text-2xl font-bold text-white">
                  {formatTierCents(entryTierCents)}
                </p>
              </LandingGlassCard>
            </div>

            {data.myEntry?.predictedTotal != null ? (
              <LandingGlassCard className="p-5 mb-6 border border-emerald-500/25">
                <p className="text-xs uppercase text-emerald-400 mb-1">Your prediction</p>
                <p className="text-3xl font-bold text-white">{data.myEntry.predictedTotal}</p>
                <p className="text-xs text-sb-muted mt-2">
                  Combined MNF total points · {locked ? "Locked" : "Editable until kickoff"}
                </p>
              </LandingGlassCard>
            ) : data.playerStatus?.status === "tiebreaker" && !locked ? (
              <LandingGlassCard className="p-5 sm:p-6 mb-6">
                <form onSubmit={handleSubmit}>
                  <label htmlFor="tb-prediction" className="block text-sm text-sb-muted mb-2">
                    Combined final score prediction
                  </label>
                  <input
                    id="tb-prediction"
                    type="number"
                    min={0}
                    max={200}
                    required
                    value={prediction}
                    onChange={(e) => setPrediction(e.target.value)}
                    placeholder="e.g. 58"
                    className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 text-lg mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Submit prediction"}
                  </Button>
                </form>
              </LandingGlassCard>
            ) : null}

            {data.tiebreaker?.actualTotalPoints != null ? (
              <LandingGlassCard className="p-5 mb-6 text-center">
                <p className="text-xs uppercase text-sb-muted mb-1">Final MNF combined score</p>
                <p className="text-4xl font-bold text-white">
                  {data.tiebreaker.actualTotalPoints}
                </p>
              </LandingGlassCard>
            ) : null}

            {data.tiebreaker?.status === "complete" ||
            data.tiebreaker?.status === "split" ? (
              <LandingGlassCard className="p-6 mb-6 text-center border border-emerald-500/30 pickem-winner-reveal">
                <p className="text-xs uppercase tracking-widest text-emerald-400 mb-2">
                  {data.tiebreaker.status === "split" ? "Official Tie" : "Winner Revealed"}
                </p>
                <p className="text-2xl font-bold text-white mb-2">
                  {data.playerStatus?.status === "winner"
                    ? "🏆 You won the pool!"
                    : data.playerStatus?.status === "prize_split"
                      ? "🤝 Prize split — payout processing"
                      : "Championship resolved"}
                </p>
                {data.myEntry?.predictedTotal != null ? (
                  <p className="text-sm text-sb-muted">
                    Your prediction: {data.myEntry.predictedTotal} · Actual:{" "}
                    {data.tiebreaker.actualTotalPoints ?? "—"}
                  </p>
                ) : null}
              </LandingGlassCard>
            ) : null}

            <div className="flex flex-wrap justify-center gap-3">
              <Button
                href={`/pickem/week?contestId=${encodeURIComponent(contestId ?? "")}&tier=${entryTierCents}`}
                variant="secondary"
              >
                Back to picks
              </Button>
              <Link href="/pickem/history" className="text-sm text-sb-muted hover:text-white">
                View history
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
