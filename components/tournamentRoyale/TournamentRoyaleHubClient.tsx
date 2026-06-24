"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ExperienceHero from "@/components/ui/ExperienceHero";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import { Button } from "@/components/ui/Button";
import { formatUserError } from "@/lib/errors/formatUserError";
import { CONTEST_CTAS } from "@/lib/platform/language";
import PlayEligibilityBanner from "@/components/player/PlayEligibilityBanner";
import TournamentRoyaleLiveMap from "@/components/tournamentRoyale/TournamentRoyaleLiveMap";
import TournamentRoyaleTournamentSwitcher from "@/components/tournamentRoyale/TournamentRoyaleTournamentSwitcher";
import { cinderellaTierLabel } from "@/lib/tournamentRoyale/cinderella";
import {
  parseTournamentKey,
  TOURNAMENT_ROYALE_PUBLIC_NAME,
} from "@/lib/tournamentRoyale/config";
import { tournamentRoyaleApiUrl, tournamentRoyalePath } from "@/lib/tournamentRoyale/routes";
import type { TournamentHubView } from "@/lib/tournamentRoyale/types";

function HubContent() {
  const searchParams = useSearchParams();
  const tournamentKey = parseTournamentKey(searchParams.get("tournament"));
  const query = tournamentKey !== "ncaab_mens" ? { tournament: tournamentKey } : undefined;

  const [view, setView] = useState<TournamentHubView | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  const loadHub = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(tournamentRoyaleApiUrl("hub", query));
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load hub.");
      }
      setView(await res.json());
    } catch (err) {
      setError(formatUserError(err, "load"));
    } finally {
      setLoading(false);
    }
  }, [tournamentKey]);

  useEffect(() => {
    loadHub();
  }, [loadHub]);

  const handleJoin = async () => {
    setJoining(true);
    setError(null);
    try {
      const res = await fetch(tournamentRoyaleApiUrl("join"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentKey }),
      });
      if (res.status === 401) {
        setAuthRequired(true);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not join.");
      }
      await loadHub();
    } catch (err) {
      setError(formatUserError(err, "join"));
    } finally {
      setJoining(false);
    }
  };

  const bracketHref =
    tournamentKey === "ncaab_mens"
      ? tournamentRoyalePath("bracket")
      : `${tournamentRoyalePath("bracket")}?tournament=${tournamentKey}`;

  return (
    <div className="tr-page min-h-screen relative overflow-x-hidden">
      <AmbientBackground className="tr-ambient-blue" fixed />
      <AppMenuBar logoHref={tournamentRoyalePath()} />

      <div className="relative z-10 px-4 pb-16 max-w-5xl mx-auto">
        <div className="flex justify-center pt-8 mb-6">
          <Suspense fallback={null}>
            <TournamentRoyaleTournamentSwitcher />
          </Suspense>
        </div>

        <ExperienceHero
          badgeLabel="Tournament Hub"
          badgeVariant="live"
          title={view?.event.name ?? TOURNAMENT_ROYALE_PUBLIC_NAME}
          subtitle={
            view
              ? `${view.event.currentRoundLabel} · ${view.stats.gamesRemaining} games remaining`
              : "Your tournament headquarters"
          }
          cta={{ label: "Open Bracket", href: bracketHref }}
        />

        <PlayEligibilityBanner className="mt-4" />

        {error && (
          <p className="text-center text-red-400 text-sm mt-4" role="alert">
            {error}
          </p>
        )}

        {authRequired && (
          <p className="text-center text-sm text-sb-muted mt-4">
            <Link href="/auth/login" className="text-sb-glow hover:text-white">
              Sign in
            </Link>{" "}
            to join the tournament.
          </p>
        )}

        {loading && !view && (
          <BrandedLoadingLabel context="tournament" className="text-center text-sb-muted mt-8" />
        )}

        {view && (
          <>
            {!view.joined && (
              <div className="flex justify-center mt-6">
                <Button onClick={handleJoin} disabled={joining}>
                  {joining ? "Joining…" : CONTEST_CTAS.joinTheContest}
                </Button>
              </div>
            )}

            {view.entry && (
              <div className="tr-hub-stats grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
                <LandingGlassCard className="p-4 tr-stat-card">
                  <p className="text-xs text-sb-muted uppercase tracking-wide">Accuracy</p>
                  <p className="text-2xl font-bold text-white">{view.entry.accuracyPct}%</p>
                </LandingGlassCard>
                <LandingGlassCard className="p-4 tr-stat-card">
                  <p className="text-xs text-sb-muted uppercase tracking-wide">Bracket Complete</p>
                  <p className="text-2xl font-bold text-white">{view.entry.bracketCompletionPct}%</p>
                </LandingGlassCard>
                <LandingGlassCard className="p-4 tr-stat-card">
                  <p className="text-xs text-sb-muted uppercase tracking-wide">Rank</p>
                  <p className="text-2xl font-bold text-white">
                    {view.stats.communityRank ? `#${view.stats.communityRank}` : "—"}
                  </p>
                </LandingGlassCard>
                <LandingGlassCard className="p-4 tr-stat-card">
                  <p className="text-xs text-sb-muted uppercase tracking-wide">Tournament XP</p>
                  <p className="text-2xl font-bold text-blue-300">{view.entry.tournamentXp}</p>
                </LandingGlassCard>
              </div>
            )}

            {view.entry && (
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <LandingGlassCard className="p-5">
                  <p className="text-xs uppercase tracking-wider text-blue-400/90 font-bold mb-3">
                    Cinderella Meter™
                  </p>
                  <div className="tr-cinderella-meter">
                    <div
                      className="tr-cinderella-fill"
                      style={{ width: `${Math.min(100, view.entry.cinderellaMeter)}%` }}
                    />
                  </div>
                  <p className="text-sm text-white mt-2 font-semibold">
                    {cinderellaTierLabel(view.entry.cinderellaMeter)}
                  </p>
                  <p className="text-xs text-sb-muted mt-1">{view.entry.cinderellaMeter} / 100</p>
                </LandingGlassCard>

                <LandingGlassCard className="p-5">
                  <p className="text-xs uppercase tracking-wider text-blue-400/90 font-bold mb-3">
                    Bracket Combos™
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {view.entry.comboStreak} streak
                    {view.entry.comboMultiplier > 1 && (
                      <span className="text-orange-400 ml-2">x{view.entry.comboMultiplier}</span>
                    )}
                  </p>
                  <p className="text-sm text-sb-muted mt-1">
                    Best streak: {view.entry.bestComboStreak}
                  </p>
                  {view.entry.shieldAvailable && (
                    <p className="text-xs text-emerald-400 mt-3">🛡 Bracket Shield™ ready</p>
                  )}
                </LandingGlassCard>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <LandingGlassCard className="p-5">
                <p className="text-xs uppercase tracking-wider text-blue-400/90 font-bold mb-3">
                  Highlights
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="text-sb-muted">
                    Best Upset:{" "}
                    <span className="text-white">{view.stats.bestUpset ?? "—"}</span>
                  </li>
                  <li className="text-sb-muted">
                    Biggest Miss:{" "}
                    <span className="text-white">{view.stats.biggestMiss ?? "—"}</span>
                  </li>
                  <li className="text-sb-muted">
                    Reward Progress:{" "}
                    <span className="text-white">{view.stats.rewardProgressPct}%</span>
                  </li>
                </ul>
              </LandingGlassCard>

              <LandingGlassCard className="p-5">
                <TournamentRoyaleLiveMap liveMap={view.liveMap} />
              </LandingGlassCard>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Button href={bracketHref}>Open Bracket</Button>
              <Button href={tournamentRoyalePath("learn")} variant="secondary">
                How to Play
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TournamentRoyaleHubClient() {
  return (
    <Suspense fallback={null}>
      <HubContent />
    </Suspense>
  );
}
