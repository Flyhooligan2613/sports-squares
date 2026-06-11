"use client";

import { getActivePeriodFromGame } from "@/lib/espn/sync";
import { normalizeEspnSport } from "@/lib/espn/sports";
import type { EspnLiveGame, EspnSport } from "@/lib/types";

interface LiveScoreBannerProps {
  game: EspnLiveGame;
  poolHomeTeam: string;
  poolAwayTeam: string;
  syncing?: boolean;
  lastSyncAt?: Date | null;
  syncError?: string | null;
  espnSyncActive?: boolean;
  espnSport?: EspnSport | null;
}

export default function LiveScoreBanner({
  game,
  poolHomeTeam,
  poolAwayTeam,
  syncing = false,
  lastSyncAt,
  syncError,
  espnSyncActive = true,
  espnSport,
}: LiveScoreBannerProps) {
  const sport = normalizeEspnSport(espnSport);
  const periodLabel = game.gameCompleted
    ? "Final"
    : sport === "ncaab"
      ? game.period <= 1
        ? "1st Half"
        : game.period === 2
          ? "2nd Half"
          : "Final"
      : game.period > 4
        ? `OT (P${game.period})`
        : game.period > 0
          ? `Q${game.period}`
          : "Pre-game";
  const activePeriod = getActivePeriodFromGame(game, sport);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {!game.gameCompleted && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                game.gameCompleted ? "bg-slate-500" : "bg-green-500"
              }`}
            />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {game.gameCompleted ? "Final Score" : "Live Score"}
          </span>
        </div>
        {espnSyncActive && (
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            {syncing ? (
              <span className="text-indigo-400">Syncing ESPN...</span>
            ) : lastSyncAt ? (
              <span>Updated {lastSyncAt.toLocaleTimeString()}</span>
            ) : null}
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              Auto-sync 60s
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 sm:gap-8">
        <TeamScore
          label={poolAwayTeam}
          espnLabel={game.awayTeam}
          score={game.awayScore}
          align="right"
        />
        <div className="text-center shrink-0">
          <p className="text-2xl font-bold text-slate-600">–</p>
          <p className="text-[10px] text-slate-500 mt-1 font-medium uppercase tracking-wide">
            {periodLabel}
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5">
            {game.statusDetail} &middot; {activePeriod}
          </p>
        </div>
        <TeamScore
          label={poolHomeTeam}
          espnLabel={game.homeTeam}
          score={game.homeScore}
          align="left"
        />
      </div>

      {syncError && (
        <p className="text-amber-400/90 text-xs mt-3 text-center bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          ESPN sync: {syncError}. Manual score entry still available.
        </p>
      )}
    </div>
  );
}

function TeamScore({
  label,
  espnLabel,
  score,
  align,
}: {
  label: string;
  espnLabel: string;
  score: number;
  align: "left" | "right";
}) {
  return (
    <div className={`flex-1 min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <p className="text-sm font-semibold text-slate-200 truncate">{label}</p>
      {espnLabel !== label && (
        <p className="text-[10px] text-slate-600 truncate">{espnLabel}</p>
      )}
      <p className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-mono mt-1">
        {score}
      </p>
    </div>
  );
}
