"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import CommandCenterSyncBanner from "@/components/admin/commandCenter/CommandCenterSyncBanner";
import { getDemoPlayers } from "@/lib/platform/engines/commandCenter/mockData";
import { fetchCommandCenter } from "@/hooks/useCommandCenterHydration";

interface PlatformPlayerRow {
  email: string;
  displayName: string | null;
  slug: string | null;
  accountSuspended: boolean;
  securityFlagged: boolean;
  createdAt: string | null;
}

type PlayerFilter = "all" | "suspended" | "flagged";

function parsePlayers(body: Record<string, unknown>) {
  if (Array.isArray(body.players)) {
    return {
      value: body.players as PlatformPlayerRow[],
      demo: Boolean(body.demo),
    };
  }
  return null;
}

export default function AdminPlatformPlayersClient() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PlayerFilter>("all");
  const [players, setPlayers] = useState<PlatformPlayerRow[]>(getDemoPlayers());
  const [hydrating, setHydrating] = useState(true);
  const [usingDemo, setUsingDemo] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecent = useCallback(async () => {
    setHydrating(true);
    setError(null);
    const parsed = await fetchCommandCenter(
      "/api/admin/command-center/players?recent=20",
      parsePlayers
    );
    if (parsed) {
      setPlayers(parsed.value);
      setUsingDemo(parsed.demo);
    }
    setHydrating(false);
  }, []);

  useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setSearching(true);
    setError(null);
    const parsed = await fetchCommandCenter(
      `/api/admin/command-center/players?q=${encodeURIComponent(query.trim())}`,
      parsePlayers
    );
    if (parsed) {
      setPlayers(parsed.value);
      setUsingDemo(parsed.demo);
    } else {
      setError("Player search failed.");
    }
    setSearching(false);
  }

  const filtered = players.filter((p) => {
    if (filter === "suspended") return p.accountSuspended;
    if (filter === "flagged") return p.securityFlagged;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Player Management"
        subtitle="Search competitors, review account status, and open security controls."
        action={
          <Button href="/admin/security" variant="secondary" size="sm">
            Security Center
          </Button>
        }
      />

      <CommandCenterSyncBanner hydrating={hydrating} usingDemo={usingDemo} />

      <LandingGlassCard className="p-4 sm:p-5 space-y-4 sb-card-lift">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email, username, or display name"
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-sb-muted focus:outline-none focus:border-sb-purple/40"
          />
          <Button type="submit" disabled={searching || query.trim().length < 2}>
            {searching ? "Searching…" : "Search"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => void loadRecent()}>
            Recent
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {(["all", "suspended", "flagged"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={[
                "text-xs px-3 py-1.5 rounded-full border transition-colors capitalize",
                filter === f
                  ? "border-sb-purple/40 bg-sb-purple/15 text-white"
                  : "border-white/10 text-sb-muted hover:text-white",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
      </LandingGlassCard>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {filtered.length === 0 ? (
        <LandingGlassCard className="p-8 text-center text-sb-muted text-sm">
          No players match your search or filter.
        </LandingGlassCard>
      ) : (
        <LandingGlassCard className="p-0 overflow-hidden sb-card-lift">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-sb-muted border-b border-white/10">
                  <th className="px-4 py-3 font-semibold">Player</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((player) => (
                  <tr
                    key={player.email}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">
                        {player.displayName ?? player.email}
                      </p>
                      <p className="text-xs text-sb-muted">{player.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {player.accountSuspended ? (
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
                            Suspended
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                        {player.securityFlagged ? (
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Flagged
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sb-muted tabular-nums text-xs">
                      {player.createdAt
                        ? new Date(player.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        {player.slug ? (
                          <Link
                            href={`/profile/${player.slug}`}
                            className="text-xs text-sb-glow hover:text-white"
                          >
                            Profile
                          </Link>
                        ) : null}
                        <Link
                          href={`/admin/security?email=${encodeURIComponent(player.email)}`}
                          className="text-xs text-sb-glow hover:text-white"
                        >
                          Security
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LandingGlassCard>
      )}
    </div>
  );
}
