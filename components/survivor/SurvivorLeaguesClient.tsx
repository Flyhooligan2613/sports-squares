"use client";

import { useEffect, useState } from "react";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { SURVIVOR_X_PUBLIC_NAME } from "@/lib/survivor/config";
import { survivorApiUrl, survivorPath, survivorWeekHref } from "@/lib/survivor/routes";

interface LeagueRow {
  id: string;
  name: string;
  description: string | null;
  mode: string;
  livesPerPlayer: number;
  currentWeek: number;
  status: string;
  entry: {
    id: string;
    status: string;
    livesRemaining: number;
  } | null;
}

export default function SurvivorLeaguesClient() {
  const [leagues, setLeagues] = useState<LeagueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(survivorApiUrl("leagues"), { cache: "no-store" });
        if (!res.ok) throw new Error("Could not load leagues.");
        const data = (await res.json()) as { leagues: LeagueRow[] };
        setLeagues(data.leagues ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleJoin(leagueId: string) {
    setJoiningId(leagueId);
    setError(null);
    try {
      const res = await fetch(survivorApiUrl("join"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leagueId }),
        credentials: "include",
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Could not join.");
      setLeagues((prev) =>
        prev.map((l) =>
          l.id === leagueId
            ? {
                ...l,
                entry: {
                  id: "joined",
                  status: "active",
                  livesRemaining: l.livesPerPlayer,
                },
              }
            : l
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join.");
    } finally {
      setJoiningId(null);
    }
  }

  return (
    <div className="survivor-page min-h-screen relative overflow-x-hidden">
      <AmbientBackground className="survivor-ambient-amber" fixed />
      <AppMenuBar logoHref={survivorPath()} />

      <div className="relative z-10">
        <LandingSection variant="glow" className="pt-8 sm:pt-12">
          <ScrollReveal>
            <LandingSectionHeader
              eyebrow="Leagues"
              title="Choose your Survivor"
              subtitle="Global Classic, Double Life, and Turbo playoffs sprint — pick your format."
            />
          </ScrollReveal>

          {loading ? (
            <p className="text-center text-sb-muted py-12">Loading leagues…</p>
          ) : null}

          {error ? (
            <p className="text-center text-red-400 text-sm py-4" role="alert">
              {error}
            </p>
          ) : null}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
            {leagues.map((league) => (
              <LandingGlassCard key={league.id} className="p-6 flex flex-col h-full">
                <p className="text-3xl mb-3" aria-hidden>
                  {league.mode === "double_life" ? "🔥" : league.mode === "turbo" ? "⚡" : "🌎"}
                </p>
                <h2 className="text-lg font-bold text-white mb-2">{league.name}</h2>
                <p className="text-sm text-sb-muted leading-relaxed flex-1 mb-4">
                  {league.description}
                </p>
                <p className="text-xs text-sb-muted mb-4">
                  {league.livesPerPlayer} {league.livesPerPlayer === 1 ? "life" : "lives"} · Week{" "}
                  {league.currentWeek} · 1 Shield per season
                </p>
                <div className="flex flex-wrap gap-2">
                  {league.entry ? (
                    <Button href={survivorWeekHref(league.id)}>Play This Week</Button>
                  ) : (
                    <Button
                      disabled={joiningId === league.id}
                      onClick={() => void handleJoin(league.id)}
                    >
                      {joiningId === league.id ? "Joining…" : "Join Free"}
                    </Button>
                  )}
                </div>
              </LandingGlassCard>
            ))}
          </div>

          <div className="text-center mt-10 flex flex-wrap gap-3 justify-center">
            <Button href={survivorPath("private")} variant="secondary">
              Private Leagues
            </Button>
            <Button href={survivorPath()} variant="secondary">
              Back to {SURVIVOR_X_PUBLIC_NAME}
            </Button>
          </div>
        </LandingSection>
      </div>
    </div>
  );
}
