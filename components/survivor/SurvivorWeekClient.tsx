"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ExperienceHero from "@/components/ui/ExperienceHero";
import { Button } from "@/components/ui/Button";
import PlayEligibilityBanner from "@/components/player/PlayEligibilityBanner";
import SurvivorLiveMap from "@/components/survivor/SurvivorLiveMap";
import SurvivorStayInGamePanel from "@/components/survivor/SurvivorStayInGamePanel";
import SurvivorEliminationMoment, {
  eliminationStorageKey,
} from "@/components/survivor/SurvivorEliminationMoment";
import SurvivorShieldActivation, {
  shieldActivationStorageKey,
} from "@/components/survivor/SurvivorShieldActivation";
import SurvivorShieldBadge from "@/components/survivor/SurvivorShieldBadge";
import { SURVIVOR_X_PUBLIC_NAME } from "@/lib/survivor/config";
import { survivorApiUrl, survivorPath } from "@/lib/survivor/routes";
import type { SurvivorWeekView } from "@/lib/survivor/types";

interface WeekOption {
  id: string;
  weekNumber: number;
  label: string;
  status: string;
  isCurrent: boolean;
}

export default function SurvivorWeekClient() {
  const [view, setView] = useState<SurvivorWeekView | null>(null);
  const [weeks, setWeeks] = useState<WeekOption[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [joining, setJoining] = useState(false);
  const [showShieldActivation, setShowShieldActivation] = useState(false);
  const [showEliminationMoment, setShowEliminationMoment] = useState(false);

  const dismissShieldActivation = useCallback(() => {
    if (view?.entry && view.myPick?.result === "shield_saved") {
      sessionStorage.setItem(
        shieldActivationStorageKey(view.entry.id, view.week.weekNumber),
        "1"
      );
    }
    setShowShieldActivation(false);
  }, [view]);

  useEffect(() => {
    if (!view?.entry || view.myPick?.result !== "shield_saved") {
      setShowShieldActivation(false);
      return;
    }

    const key = shieldActivationStorageKey(view.entry.id, view.week.weekNumber);
    if (sessionStorage.getItem(key)) {
      setShowShieldActivation(false);
      return;
    }

    setShowShieldActivation(true);
  }, [view]);

  const dismissEliminationMoment = useCallback(() => {
    if (view?.entry && view.entry.status === "eliminated") {
      sessionStorage.setItem(
        eliminationStorageKey(view.entry.id, view.week.weekNumber),
        "1"
      );
    }
    setShowEliminationMoment(false);
  }, [view]);

  useEffect(() => {
    if (!view?.entry || view.entry.status !== "eliminated") {
      setShowEliminationMoment(false);
      return;
    }
    if (view.myPick?.result !== "eliminated") {
      setShowEliminationMoment(false);
      return;
    }

    const key = eliminationStorageKey(view.entry.id, view.week.weekNumber);
    if (sessionStorage.getItem(key)) {
      setShowEliminationMoment(false);
      return;
    }

    setShowEliminationMoment(true);
  }, [view]);

  const loadWeeks = useCallback(async () => {
    const res = await fetch(survivorApiUrl("weeks"), { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setWeeks(data.weeks ?? []);
    const current = data.weeks?.find((w: WeekOption) => w.isCurrent);
    if (current) setSelectedWeek(current.weekNumber);
  }, []);

  const loadWeek = useCallback(async (weekNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        survivorApiUrl("week", { weekNumber }),
        { cache: "no-store" }
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Failed to load week.");
      }
      const data = (await res.json()) as SurvivorWeekView;
      setView(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load week.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWeeks();
  }, [loadWeeks]);

  useEffect(() => {
    void loadWeek(selectedWeek);
    const timer = window.setInterval(() => void loadWeek(selectedWeek), 60_000);
    return () => window.clearInterval(timer);
  }, [selectedWeek, loadWeek]);

  async function handleJoin() {
    setJoining(true);
    setError(null);
    try {
      const res = await fetch(survivorApiUrl("join"), { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) setAuthRequired(true);
        throw new Error(json.error ?? "Could not join.");
      }
      await loadWeek(selectedWeek);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join.");
    } finally {
      setJoining(false);
    }
  }

  async function handlePick(game: SurvivorWeekView["games"][number]) {
    if (!view || game.picksLocked || game.isUsedTeam || saving) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(survivorApiUrl("picks"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leagueId: view.league.id,
          weekId: view.week.id,
          teamAbbr: game.teamAbbr,
          teamName: game.teamName,
          espnGameId: game.espnGameId,
          kickoffAt: game.kickoffAt,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) setAuthRequired(true);
        throw new Error(json.error ?? "Could not lock pick.");
      }
      await loadWeek(selectedWeek);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not lock pick.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="survivor-page min-h-screen relative overflow-x-hidden">
      <AmbientBackground className="survivor-ambient-amber" fixed />
      <AppMenuBar logoHref={survivorPath()} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <ExperienceHero
          badgeLabel={SURVIVOR_X_PUBLIC_NAME}
          badgeVariant="live"
          title={view?.week.label ?? "Loading week…"}
          subtitle={
            view
              ? `${view.league.name} · One pick per week · One shield per season`
              : "Global Classic — your Survivor Shield™ is your second chance"
          }
        />

        <div className="flex flex-wrap gap-2 justify-center mt-4 mb-6">
          <Button href={survivorPath("learn")} variant="secondary">
            How to Play
          </Button>
          <Button href={survivorPath()} variant="secondary">
            Hub
          </Button>
        </div>

        <PlayEligibilityBanner className="mb-4" />

        {weeks.length > 0 ? (
          <LandingGlassCard className="p-4 mb-6">
            <label htmlFor="survivor-week-select" className="block text-xs uppercase tracking-wider text-sb-muted mb-2">
              Select week
            </label>
            <select
              id="survivor-week-select"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value, 10))}
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              {weeks.map((w) => (
                <option key={w.id} value={w.weekNumber} className="bg-sb-bg text-white">
                  {w.label}
                  {w.isCurrent ? " · Current" : ""}
                  {w.status === "complete" ? " · Final" : ""}
                </option>
              ))}
            </select>
          </LandingGlassCard>
        ) : null}

        {loading && !view ? (
          <p className="text-center text-sb-muted py-12">Loading survival board…</p>
        ) : null}

        {error ? (
          <p className="text-center text-red-400 text-sm mb-4" role="alert">
            {error}
          </p>
        ) : null}

        {authRequired ? (
          <LandingGlassCard className="p-6 text-center mb-6">
            <p className="text-white font-semibold mb-2">Sign in to play</p>
            <Button href="/my-games/login">Sign in</Button>
          </LandingGlassCard>
        ) : null}

        {view && !view.entry && !authRequired ? (
          <LandingGlassCard className="p-6 text-center mb-6">
            <p className="text-white font-semibold mb-2">Join Global Survivor</p>
            <p className="text-sm text-sb-muted mb-4">
              Free entry — lock one NFL team each week. Every player starts with one Survivor Shield™.
            </p>
            <Button onClick={() => void handleJoin()} disabled={joining}>
              {joining ? "Joining…" : "Join & Play"}
            </Button>
          </LandingGlassCard>
        ) : null}

        {view?.entry &&
        (view.entry.status === "eliminated" || view.entry.status === "champion") ? (
          <SurvivorStayInGamePanel
            variant={view.entry.status === "champion" ? "champion" : "eliminated"}
            weeksSurvived={view.entry.weeksSurvived}
            shieldUsedWeek={view.entry.shieldUsedWeek}
            displayName={view.entry.displayName}
          />
        ) : null}

        {view?.entry && view.entry.status === "active" ? (
          <LandingGlassCard className="p-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-sb-muted">Your status</p>
                <p className="text-lg font-bold text-white">{view.entry.displayName}</p>
              </div>
              <div className="flex gap-4 text-center items-end flex-wrap justify-end">
                <SurvivorShieldBadge
                  available={view.entry.shieldAvailable}
                  usedWeek={view.entry.shieldUsedWeek}
                />
                <div>
                  <p className="text-[10px] uppercase text-sb-muted">Status</p>
                  <p className="font-bold text-amber-400 capitalize">{view.entry.status}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-sb-muted">Weeks survived</p>
                  <p className="font-bold text-white font-mono">{view.entry.weeksSurvived}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-sb-muted">Lives</p>
                  <p className="font-bold text-white font-mono">{view.entry.livesRemaining}</p>
                </div>
              </div>
            </div>
            {view.myPick ? (
              <p className="text-sm text-sb-muted mt-3">
                Locked pick:{" "}
                <span className="text-white font-semibold">{view.myPick.teamName}</span>
                {" · "}
                <span
                  className={
                    view.myPick.result === "shield_saved"
                      ? "text-violet-300 font-semibold capitalize"
                      : "capitalize"
                  }
                >
                  {view.myPick.result === "shield_saved"
                    ? "shield saved you"
                    : view.myPick.result}
                </span>
              </p>
            ) : view.canPick ? (
              <p className="text-sm text-amber-400/90 mt-3">
                Choose one team below — you cannot reuse a team this season.
              </p>
            ) : null}
          </LandingGlassCard>
        ) : null}

        {showShieldActivation && view?.entry && view.myPick ? (
          <SurvivorShieldActivation
            displayName={view.entry.displayName}
            teamName={view.myPick.teamName}
            weekNumber={view.week.weekNumber}
            onComplete={dismissShieldActivation}
          />
        ) : null}

        {showEliminationMoment && view?.entry && view.myPick ? (
          <SurvivorEliminationMoment
            displayName={view.entry.displayName}
            teamName={view.myPick.teamName}
            weekNumber={view.week.weekNumber}
            weeksSurvived={view.entry.weeksSurvived}
            onComplete={dismissEliminationMoment}
          />
        ) : null}

        {view ? <SurvivorLiveMap stats={view.liveMap} /> : null}

        {view && view.usedTeams.length > 0 ? (
          <p className="text-xs text-sb-muted mb-4 text-center">
            Teams used: {view.usedTeams.join(", ")}
          </p>
        ) : null}

        {view ? (
          <div className="space-y-2">
            {view.entry?.status === "active" ? (
              <p className="text-xs text-center text-sb-muted mb-2">Lock your team for this week</p>
            ) : view.entry ? (
              <p className="text-xs text-center text-sb-muted mb-2">
                Spectator view — teams on the board this week
              </p>
            ) : null}
            {view.games.map((game) => {
              const disabled =
                !view.canPick ||
                game.picksLocked ||
                game.isUsedTeam ||
                saving ||
                view.entry?.status !== "active";

              return (
                <button
                  key={`${game.espnGameId}-${game.teamAbbr}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => void handlePick(game)}
                  className={[
                    "w-full text-left landing-glass-card p-4 sm:p-5 transition-all",
                    game.isSelected ? "border-amber-400/50 ring-1 ring-amber-400/30" : "",
                    game.isUsedTeam ? "opacity-40 cursor-not-allowed" : "hover:border-amber-400/30",
                    disabled && !game.isSelected ? "opacity-60" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white font-bold">{game.teamName}</p>
                      <p className="text-xs text-sb-muted mt-0.5">
                        {game.awayTeam} vs {game.homeTeam}
                      </p>
                      <p className="text-[10px] text-sb-muted mt-1">
                        {new Date(game.kickoffAt).toLocaleString(undefined, {
                          weekday: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      {game.isSelected ? (
                        <span className="text-xs font-bold text-amber-400 uppercase">Your pick</span>
                      ) : game.isUsedTeam ? (
                        <span className="text-xs text-sb-muted">Used</span>
                      ) : game.status === "live" ? (
                        <span className="text-xs font-bold text-red-400">Live</span>
                      ) : (
                        <span className="text-xs font-bold text-sb-muted">{game.teamAbbr}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        <p className="text-center text-xs text-sb-muted mt-8">
          <Link href={survivorPath()} className="text-sb-glow hover:text-white transition-colors">
            ← Back to {SURVIVOR_X_PUBLIC_NAME}
          </Link>
        </p>
      </div>
    </div>
  );
}
