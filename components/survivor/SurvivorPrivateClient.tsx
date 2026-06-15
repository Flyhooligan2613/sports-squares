"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, KeyRound, Users } from "lucide-react";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import { SURVIVOR_X_PUBLIC_NAME } from "@/lib/survivor/config";
import { survivorApiUrl, survivorPath, survivorWeekHref } from "@/lib/survivor/routes";

interface PrivateLeagueRow {
  id: string;
  name: string;
  description: string | null;
  mode: string;
  livesPerPlayer: number;
  currentWeek: number;
  status: string;
  inviteCode: string | null;
  maxPlayers: number | null;
  playerCount?: number;
  isCreator: boolean;
  entry: {
    id: string;
    status: string;
    livesRemaining: number;
  } | null;
}

export default function SurvivorPrivateClient() {
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code") ?? "";

  const [privateLeagues, setPrivateLeagues] = useState<PrivateLeagueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  const [createName, setCreateName] = useState("");
  const [createLives, setCreateLives] = useState<1 | 2>(1);
  const [createMaxPlayers, setCreateMaxPlayers] = useState("");
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const [joinCode, setJoinCode] = useState(codeFromUrl.toUpperCase());
  const [joining, setJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadLeagues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(survivorApiUrl("leagues"), {
        cache: "no-store",
        credentials: "include",
      });
      if (res.status === 401) {
        setAuthRequired(true);
        setPrivateLeagues([]);
        return;
      }
      if (!res.ok) throw new Error("Could not load leagues.");
      const data = (await res.json()) as { privateLeagues?: PrivateLeagueRow[] };
      setPrivateLeagues(data.privateLeagues ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeagues();
  }, [loadLeagues]);

  useEffect(() => {
    if (codeFromUrl) setJoinCode(codeFromUrl.toUpperCase());
  }, [codeFromUrl]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateSuccess(null);
    setError(null);
    try {
      const maxPlayers = createMaxPlayers.trim()
        ? parseInt(createMaxPlayers, 10)
        : null;

      const res = await fetch(survivorApiUrl("leagues"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: createName,
          livesPerPlayer: createLives,
          maxPlayers: Number.isFinite(maxPlayers) ? maxPlayers : null,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        league?: PrivateLeagueRow;
      };
      if (!res.ok) throw new Error(json.error ?? "Could not create league.");
      if (json.league) {
        setPrivateLeagues((prev) => {
          const next = prev.filter((l) => l.id !== json.league!.id);
          return [...next, json.league!];
        });
        setCreateSuccess(
          json.league.inviteCode
            ? `League created! Share code ${json.league.inviteCode} with friends.`
            : "League created!"
        );
        setCreateName("");
        setCreateMaxPlayers("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create league.");
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;

    setJoining(true);
    setJoinMessage(null);
    setError(null);
    try {
      const res = await fetch(survivorApiUrl("join"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ inviteCode: code }),
      });
      const json = (await res.json()) as { error?: string; entry?: { id: string } };
      if (!res.ok) throw new Error(json.error ?? "Could not join.");
      setJoinMessage("You're in! Head to Play This Week below.");
      setJoinCode("");
      await loadLeagues();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join.");
    } finally {
      setJoining(false);
    }
  }

  async function handleJoinByLeagueId(leagueId: string) {
    setJoining(true);
    setError(null);
    try {
      const res = await fetch(survivorApiUrl("join"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leagueId }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Could not join.");
      await loadLeagues();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join.");
    } finally {
      setJoining(false);
    }
  }

  async function copyInviteCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      setCopiedCode(null);
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
              eyebrow="Private Leagues"
              title="Survivor with your crew"
              subtitle="Create a free league, share an invite code, and compete all season — Shields included."
            />
          </ScrollReveal>

          {authRequired ? (
            <div className="max-w-md mx-auto mt-8">
              <Alert variant="info">
                Sign in to create or join a private Survivor league.
              </Alert>
              <div className="text-center mt-4">
                <Button href="/my-games/login?redirect=/survivor/private">Sign In</Button>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto mt-8 space-y-6">
              {error ? (
                <p className="text-center text-red-400 text-sm" role="alert">
                  {error}
                </p>
              ) : null}
              {createSuccess ? (
                <Alert variant="success">{createSuccess}</Alert>
              ) : null}
              {joinMessage ? <Alert variant="success">{joinMessage}</Alert> : null}

              <div className="grid md:grid-cols-2 gap-4">
                <LandingGlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-amber-400" aria-hidden />
                    <h2 className="text-lg font-bold text-white">Create a league</h2>
                  </div>
                  <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
                    <div>
                      <label htmlFor="league-name" className="text-xs text-sb-muted block mb-1">
                        League name
                      </label>
                      <Input
                        id="league-name"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        placeholder="Sunday Crew Survivor"
                        maxLength={80}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="league-lives" className="text-xs text-sb-muted block mb-1">
                        Lives per player
                      </label>
                      <select
                        id="league-lives"
                        value={createLives}
                        onChange={(e) => setCreateLives(Number(e.target.value) as 1 | 2)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      >
                        <option value={1}>1 life (Classic)</option>
                        <option value={2}>2 lives (Double Life rules)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="league-max" className="text-xs text-sb-muted block mb-1">
                        Max players (optional)
                      </label>
                      <Input
                        id="league-max"
                        type="number"
                        min={2}
                        max={500}
                        value={createMaxPlayers}
                        onChange={(e) => setCreateMaxPlayers(e.target.value)}
                        placeholder="Unlimited"
                      />
                    </div>
                    <Button type="submit" disabled={creating || !createName.trim()}>
                      {creating ? "Creating…" : "Create League"}
                    </Button>
                  </form>
                </LandingGlassCard>

                <LandingGlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <KeyRound className="w-5 h-5 text-amber-400" aria-hidden />
                    <h2 className="text-lg font-bold text-white">Join with code</h2>
                  </div>
                  <form onSubmit={(e) => void handleJoin(e)} className="space-y-4">
                    <div>
                      <label htmlFor="invite-code" className="text-xs text-sb-muted block mb-1">
                        Invite code
                      </label>
                      <Input
                        id="invite-code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="AB12CD34"
                        maxLength={12}
                        className="font-mono uppercase tracking-wider"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={joining || !joinCode.trim()}>
                      {joining ? "Joining…" : "Join League"}
                    </Button>
                  </form>
                </LandingGlassCard>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white mb-4 text-center">Your private leagues</h2>
                {loading ? (
                  <p className="text-center text-sb-muted py-8">Loading…</p>
                ) : privateLeagues.length === 0 ? (
                  <p className="text-center text-sb-muted py-8 text-sm">
                    No private leagues yet — create one or join with a friend&apos;s code.
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {privateLeagues.map((league) => (
                      <LandingGlassCard key={league.id} className="p-5 flex flex-col">
                        <p className="text-2xl mb-2" aria-hidden>
                          👥
                        </p>
                        <h3 className="font-bold text-white mb-1">{league.name}</h3>
                        {league.isCreator ? (
                          <p className="text-[10px] uppercase tracking-wider text-amber-400/90 mb-2">
                            Commissioner
                          </p>
                        ) : null}
                        <p className="text-xs text-sb-muted mb-3 flex-1">
                          {league.livesPerPlayer}{" "}
                          {league.livesPerPlayer === 1 ? "life" : "lives"} · Week{" "}
                          {league.currentWeek}
                          {league.playerCount != null
                            ? ` · ${league.playerCount}${
                                league.maxPlayers ? `/${league.maxPlayers}` : ""
                              } players`
                            : ""}
                        </p>
                        {league.inviteCode ? (
                          <div className="flex items-center gap-2 mb-3">
                            <code className="text-sm font-mono text-amber-300 bg-white/5 px-2 py-1 rounded">
                              {league.inviteCode}
                            </code>
                            <button
                              type="button"
                              onClick={() => void copyInviteCode(league.inviteCode!)}
                              className="text-sb-muted hover:text-white transition-colors p-1"
                              aria-label="Copy invite code"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            {copiedCode === league.inviteCode ? (
                              <span className="text-xs text-green-400">Copied!</span>
                            ) : null}
                          </div>
                        ) : null}
                        {league.entry ? (
                          <Button href={survivorWeekHref(league.id)}>Play This Week</Button>
                        ) : (
                          <Button
                            disabled={joining}
                            onClick={() => void handleJoinByLeagueId(league.id)}
                          >
                            Join League
                          </Button>
                        )}
                      </LandingGlassCard>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-center mt-10 flex flex-wrap gap-3 justify-center">
            <Button href={survivorPath("leagues")} variant="secondary">
              Public Leagues
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
