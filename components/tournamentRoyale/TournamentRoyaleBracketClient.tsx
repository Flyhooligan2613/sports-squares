"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AmbientBackground from "@/components/ui/AmbientBackground";
import { Button } from "@/components/ui/Button";
import PlayEligibilityBanner from "@/components/player/PlayEligibilityBanner";
import {
  parseTournamentKey,
  TOURNAMENT_ROYALE_PUBLIC_NAME,
} from "@/lib/tournamentRoyale/config";
import { tournamentRoyaleApiUrl, tournamentRoyalePath } from "@/lib/tournamentRoyale/routes";
import type { BracketView } from "@/lib/tournamentRoyale/types";

function MatchupCard({
  matchup,
  canPick,
  saving,
  onPick,
}: {
  matchup: BracketView["rounds"][0]["matchups"][0];
  canPick: boolean;
  saving: string | null;
  onPick: (matchupId: string, teamName: string) => void;
}) {
  const isTbd = matchup.topTeamName === "TBD" || matchup.bottomTeamName === "TBD";
  const locked = matchup.picksLocked || !canPick || isTbd || matchup.status !== "scheduled";

  const renderTeam = (name: string, seed: number) => {
    const isWinner = matchup.winnerTeamName === name;
    const isPicked = matchup.pickedTeamName === name;
    const isLoser =
      matchup.winnerTeamName && matchup.winnerTeamName !== name && matchup.status === "final";

    return (
      <button
        type="button"
        disabled={locked || saving === matchup.id}
        onClick={() => onPick(matchup.id, name)}
        className={[
          "tr-matchup-team",
          isPicked ? "tr-matchup-team-picked" : "",
          isWinner ? "tr-matchup-team-winner" : "",
          isLoser ? "tr-matchup-team-loser" : "",
          matchup.isWinningPath && isPicked ? "tr-matchup-team-path" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="tr-matchup-seed">{seed}</span>
        <span className="tr-matchup-name">{name}</span>
        {isPicked && matchup.isCorrect === true && (
          <span className="tr-matchup-badge tr-matchup-badge-correct">✓</span>
        )}
        {isPicked && matchup.isCorrect === false && !matchup.pointsEarned && (
          <span className="tr-matchup-badge tr-matchup-badge-miss">✗</span>
        )}
        {matchup.pointsEarned > 0 && isPicked && (
          <span className="tr-matchup-points">+{matchup.pointsEarned}</span>
        )}
      </button>
    );
  };

  return (
    <div
      className={[
        "tr-matchup-card",
        matchup.status === "live" ? "tr-matchup-card-live" : "",
        matchup.isWinningPath ? "tr-matchup-card-glow" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {matchup.region && (
        <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-2">{matchup.region}</p>
      )}
      {renderTeam(matchup.topTeamName, matchup.topTeamSeed)}
      <div className="tr-matchup-divider" />
      {renderTeam(matchup.bottomTeamName, matchup.bottomTeamSeed)}
      {matchup.cinderellaPoints > 0 && (
        <p className="text-xs text-purple-300 mt-2">
          Cinderella +{matchup.cinderellaPoints}
        </p>
      )}
    </div>
  );
}

function BracketContent() {
  const searchParams = useSearchParams();
  const tournamentKey = parseTournamentKey(searchParams.get("tournament"));
  const query = tournamentKey !== "ncaab_mens" ? { tournament: tournamentKey } : undefined;

  const [view, setView] = useState<BracketView | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBracket = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(tournamentRoyaleApiUrl("bracket", query));
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load bracket.");
      }
      setView(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bracket.");
    } finally {
      setLoading(false);
    }
  }, [tournamentKey]);

  useEffect(() => {
    loadBracket();
  }, [loadBracket]);

  const handlePick = async (matchupId: string, pickedTeamName: string) => {
    setSaving(matchupId);
    setError(null);
    try {
      const res = await fetch(tournamentRoyaleApiUrl("picks"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentKey, matchupId, pickedTeamName }),
      });
      if (res.status === 401) {
        setError("Sign in to save picks.");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not save pick.");
      }
      await loadBracket();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save pick.");
    } finally {
      setSaving(null);
    }
  };

  const hubHref =
    tournamentKey === "ncaab_mens"
      ? tournamentRoyalePath("hub")
      : `${tournamentRoyalePath("hub")}?tournament=${tournamentKey}`;

  return (
    <div className="tr-page min-h-screen relative overflow-x-hidden">
      <AmbientBackground className="tr-ambient-blue" fixed />
      <AppMenuBar logoHref={tournamentRoyalePath()} />

      <div className="relative z-10 px-4 pb-16 max-w-6xl mx-auto pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-blue-400/90 font-bold">
              {TOURNAMENT_ROYALE_PUBLIC_NAME}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {view?.event.name ?? "Live Bracket"}
            </h1>
            {view?.entry && (
              <p className="text-sm text-sb-muted mt-1">
                {view.entry.bracketCompletionPct}% complete · {view.entry.totalPoints} pts
              </p>
            )}
          </div>
          <Button href={hubHref} variant="secondary">
            Tournament Hub
          </Button>
        </div>

        <PlayEligibilityBanner />

        {error && (
          <p className="text-center text-red-400 text-sm mt-4" role="alert">
            {error}{" "}
            {error.includes("Sign in") && (
              <Link href="/auth/login" className="text-sb-glow underline">
                Sign in
              </Link>
            )}
            {error.includes("Join") && (
              <Link href={hubHref} className="text-sb-glow underline ml-1">
                Join first
              </Link>
            )}
          </p>
        )}

        {loading && !view && (
          <p className="text-center text-sb-muted mt-8">Loading bracket…</p>
        )}

        {view && (
          <div className="tr-bracket-rounds space-y-10 mt-6">
            {view.rounds.map((round) => (
              <section key={round.id}>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  {round.label}
                  {round.status === "open" && (
                    <span className="text-xs font-normal text-emerald-400">Open for picks</span>
                  )}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {round.matchups.map((matchup) => (
                    <MatchupCard
                      key={matchup.id}
                      matchup={matchup}
                      canPick={view.canPick && !!view.entry}
                      saving={saving}
                      onPick={handlePick}
                    />
                  ))}
                </div>
              </section>
            ))}

            {!view.entry && (
              <LandingGlassCard className="p-6 text-center">
                <p className="text-sb-muted mb-4">Join the global bracket to start picking.</p>
                <Button href={hubHref}>Go to Tournament Hub</Button>
              </LandingGlassCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TournamentRoyaleBracketClient() {
  return (
    <Suspense fallback={null}>
      <BracketContent />
    </Suspense>
  );
}
