"use client";

import { useEffect, useState } from "react";
import { fetchEspnScoreboard } from "@/lib/espn/clientFetch";
import {
  ESPN_SPORT_LIST,
  getEspnSportConfig,
  normalizeEspnSport,
} from "@/lib/espn/sports";
import type { EspnScoreboardGame, EspnSport, Pool } from "@/lib/types";
import { poolStore } from "@/lib/poolStore";

interface EspnGameSettingsProps {
  pool: Pool;
  onUpdate: (pool: Pool) => void;
  disabled?: boolean;
}

export default function EspnGameSettings({
  pool,
  onUpdate,
  disabled = false,
}: EspnGameSettingsProps) {
  const [sport, setSport] = useState<EspnSport>(
    normalizeEspnSport(pool.espnSport)
  );
  const [gameId, setGameId] = useState(pool.espnGameId ?? "");
  const [saving, setSaving] = useState(false);
  const [games, setGames] = useState<EspnScoreboardGame[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const sportConfig = getEspnSportConfig(sport);

  useEffect(() => {
    setSport(normalizeEspnSport(pool.espnSport));
    setGameId(pool.espnGameId ?? "");
  }, [pool.espnGameId, pool.espnSport]);

  async function loadScoreboard() {
    setLoadingGames(true);
    setError("");
    setGames([]);
    try {
      const loaded = await fetchEspnScoreboard(sport);
      if (loaded.length === 0) {
        setError(
          `No ${sportConfig.label} games found on ESPN right now. Try again on game day.`
        );
      }
      setGames(loaded);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load ESPN games. You can paste a Game ID manually."
      );
    } finally {
      setLoadingGames(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const updated = await poolStore.updateEspnSettings(pool.id, {
      espnGameId: gameId.trim() || null,
      espnSport: sport,
    });

    setSaving(false);

    if (!updated) {
      setError("Could not save ESPN settings.");
      return;
    }

    onUpdate(updated);
    setMessage(
      gameId.trim()
        ? `${sportConfig.label} game linked. Scores will auto-sync every 60 seconds.`
        : "ESPN game unlinked."
    );
    setTimeout(() => setMessage(""), 4000);
  }

  function handleSelectGame(id: string) {
    setGameId(id);
    setError("");
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div>
        <h2 className="text-slate-200 font-semibold text-sm">ESPN Score Sync</h2>
        <p className="text-slate-500 text-xs mt-1">
          Link an ESPN game for automatic scoring. Manual entry remains available
          as fallback.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label
            htmlFor="espnSport"
            className="text-slate-400 text-xs font-medium block mb-1.5"
          >
            Sport
          </label>
          <select
            id="espnSport"
            value={sport}
            onChange={(e) => {
              setSport(e.target.value as EspnSport);
              setGames([]);
              setError("");
            }}
            disabled={disabled}
            className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none disabled:opacity-50"
          >
            {ESPN_SPORT_LIST.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="espnGameId"
            className="text-slate-400 text-xs font-medium block mb-1.5"
          >
            ESPN Game ID
          </label>
          <input
            id="espnGameId"
            value={gameId}
            onChange={(e) => {
              setGameId(e.target.value);
              setError("");
            }}
            disabled={disabled}
            placeholder="e.g. 401547403"
            className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono outline-none disabled:opacity-50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={disabled || saving}
            className="text-sm bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {saving ? "Saving..." : "Save ESPN Link"}
          </button>
          <button
            type="button"
            onClick={loadScoreboard}
            disabled={disabled || loadingGames}
            className="text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loadingGames ? "Loading..." : sportConfig.browseLabel}
          </button>
        </div>
      </form>

      {message && (
        <p className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
          {message}
        </p>
      )}
      {error && (
        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {pool.espnGameId && (
        <p className="text-indigo-300/80 text-xs">
          Active sync:{" "}
          <span className="text-indigo-300">
            {getEspnSportConfig(pool.espnSport).label}
          </span>{" "}
          game{" "}
          <span className="font-mono text-indigo-300">{pool.espnGameId}</span>
        </p>
      )}

      {games.length > 0 && (
        <div className="border border-slate-800 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
          <ul className="divide-y divide-slate-800">
            {games.map((game) => (
              <li key={game.id}>
                <button
                  type="button"
                  onClick={() => handleSelectGame(game.id)}
                  disabled={disabled}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-800/50 transition-colors disabled:opacity-50"
                >
                  <p className="text-xs text-slate-200 font-medium truncate">
                    {game.name}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    ID: {game.id} &middot; {game.awayTeam} {game.awayScore} –{" "}
                    {game.homeTeam} {game.homeScore} &middot; {game.status}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
