"use client";

import { useCallback, useEffect, useState } from "react";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { COMMUNITY_LABELS } from "@/lib/platform/language";
import type { StatsHubSport, TeamStandingRow } from "@/lib/statsHub/standings";

const SPORTS: { id: StatsHubSport; label: string; emoji: string }[] = [
  { id: "nfl", label: "NFL", emoji: "🏈" },
  { id: "nba", label: "NBA", emoji: "🏀" },
  { id: "mlb", label: "MLB", emoji: "⚾" },
  { id: "nhl", label: "NHL", emoji: "🏒" },
  { id: "soccer", label: "MLS", emoji: "⚽" },
];

export default function StatsHubClient() {
  const [sport, setSport] = useState<StatsHubSport>("nfl");
  const [standings, setStandings] = useState<TeamStandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/stats-hub/standings?sport=${sport}`, { cache: "no-store" });
    const json = (await res.json()) as { standings?: TeamStandingRow[] };
    setStandings(json.standings ?? []);
    setLoading(false);
  }, [sport]);

  useEffect(() => {
    void load();
  }, [load]);

  const grouped = standings.reduce<Record<string, TeamStandingRow[]>>((acc, row) => {
    const key = `${row.conference} · ${row.division}`;
    acc[key] = acc[key] ?? [];
    acc[key].push(row);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <LandingGlassCard className="p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-purple-300 mb-2">📊 Stats Hub</p>
        <h1 className="text-2xl font-bold text-white mb-2">Team Standings</h1>
        <p className="text-sm text-sb-muted">Live division and conference standings — team stats only.</p>
      </LandingGlassCard>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {SPORTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSport(s.id)}
            className={[
              "shrink-0 px-4 py-2 rounded-xl text-sm font-medium",
              sport === s.id ? "bg-sb-purple/30 text-white border border-sb-purple/40" : "bg-white/5 text-sb-muted",
            ].join(" ")}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <BrandedLoadingLabel context="leaderboard" className="text-center text-sb-muted py-16 animate-pulse" />
      ) : !standings.length ? (
        <LandingGlassCard className="p-8 text-center text-sb-muted">{COMMUNITY_LABELS.standingsUnavailable}</LandingGlassCard>
      ) : (
        Object.entries(grouped).map(([group, rows]) => (
          <LandingGlassCard key={group} className="p-4 overflow-x-auto">
            <h2 className="text-sm font-semibold text-white mb-3">{group}</h2>
            <table className="w-full text-xs min-w-[640px]">
              <thead>
                <tr className="text-sb-muted text-left border-b border-white/10">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">Team</th>
                  <th className="py-2 pr-2">W-L</th>
                  <th className="py-2 pr-2">Pct</th>
                  <th className="py-2 pr-2">Home</th>
                  <th className="py-2 pr-2">Away</th>
                  <th className="py-2 pr-2">Streak</th>
                  <th className="py-2">GB</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.team}-${row.rank}`} className="border-b border-white/5 text-white">
                    <td className="py-2 pr-2 text-sb-muted">{row.rank}</td>
                    <td className="py-2 pr-2 font-medium">{row.abbreviation}</td>
                    <td className="py-2 pr-2 tabular-nums">
                      {row.wins}-{row.losses}
                      {row.ties ? `-${row.ties}` : ""}
                    </td>
                    <td className="py-2 pr-2">{row.winPct}</td>
                    <td className="py-2 pr-2">{row.homeRecord}</td>
                    <td className="py-2 pr-2">{row.awayRecord}</td>
                    <td className="py-2 pr-2">{row.streak}</td>
                    <td className="py-2">{row.gamesBack ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </LandingGlassCard>
        ))
      )}
    </div>
  );
}
