"use client";

import { useEffect, useState } from "react";
import type { ScoringPeriod, Square, WinnerHistory, WinnerResult } from "@/lib/types";
import { QUARTERS } from "@/lib/types";
import { calculateWinner } from "@/lib/winnerEngine";
import WinnerCard from "./WinnerCard";

interface ScoringSectionProps {
  homeTeam: string;
  awayTeam: string;
  topNumbers: number[];
  sideNumbers: number[];
  squares: Square[];
  winnerHistory: WinnerHistory;
  onWinnerCalculated?: (result: WinnerResult) => void;
  activeQuarter: ScoringPeriod;
  onQuarterChange: (quarter: ScoringPeriod) => void;
  scoringPeriods?: ScoringPeriod[];
  readOnly?: boolean;
  espnSyncActive?: boolean;
}

export default function ScoringSection({
  homeTeam,
  awayTeam,
  topNumbers,
  sideNumbers,
  squares,
  winnerHistory,
  onWinnerCalculated,
  activeQuarter,
  onQuarterChange,
  scoringPeriods = QUARTERS,
  readOnly = false,
  espnSyncActive = false,
}: ScoringSectionProps) {
  const existing = winnerHistory[activeQuarter];
  const [homeScore, setHomeScore] = useState(
    existing ? String(existing.homeScore) : ""
  );
  const [awayScore, setAwayScore] = useState(
    existing ? String(existing.awayScore) : ""
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const winner = winnerHistory[activeQuarter];
    setHomeScore(winner ? String(winner.homeScore) : "");
    setAwayScore(winner ? String(winner.awayScore) : "");
    setError("");
  }, [activeQuarter, winnerHistory]);

  function handleCalculate() {
    const home = parseInt(homeScore, 10);
    const away = parseInt(awayScore, 10);

    if (Number.isNaN(home) || Number.isNaN(away) || home < 0 || away < 0) {
      setError("Enter valid scores for both teams.");
      return;
    }

    const result = calculateWinner(
      activeQuarter,
      topNumbers,
      sideNumbers,
      squares,
      home,
      away
    );

    if (!result) {
      setError("Could not find a matching square on the board.");
      return;
    }

    setError("");
    onWinnerCalculated?.(result);
  }

  const activeWinner = winnerHistory[activeQuarter];

  return (
    <section className="mt-8 space-y-5 scoring-section-enter">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-slate-100">
          {readOnly ? "Winners" : "Scoring"}
        </h2>
        <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {scoringPeriods.map((q) => {
            const hasWinner = !!winnerHistory[q];
            return (
              <button
                key={q}
                type="button"
                onClick={() => onQuarterChange(q)}
                className={[
                  "relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  activeQuarter === q
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800",
                ].join(" ")}
              >
                {q}
                {hasWinner && activeQuarter !== q && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {!readOnly && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          {espnSyncActive && (
            <p className="text-xs text-indigo-300/70 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2 mb-4">
              ESPN auto-sync is active (every 60s). Manual score entry below is
              still available as a fallback.
            </p>
          )}
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <ScoreInput
              label={`${homeTeam} Score`}
              teamLabel="Home"
              value={homeScore}
              onChange={(v) => {
                setHomeScore(v);
                setError("");
              }}
              accent="indigo"
            />
            <ScoreInput
              label={`${awayTeam} Score`}
              teamLabel="Away"
              value={awayScore}
              onChange={(v) => {
                setAwayScore(v);
                setError("");
              }}
              accent="purple"
            />
          </div>

          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

          <button
            type="button"
            onClick={handleCalculate}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-bold text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Calculate Winner
          </button>
        </div>
      )}

      {readOnly && !activeWinner && Object.keys(winnerHistory).length === 0 && (
        <p className="text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-xl p-5">
          Winners will appear here once scores are entered by the admin.
        </p>
      )}

      {activeWinner && (
        <WinnerCard
          result={activeWinner}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
        />
      )}

    </section>
  );
}

function ScoreInput({
  label,
  teamLabel,
  value,
  onChange,
  accent,
}: {
  label: string;
  teamLabel: string;
  value: string;
  onChange: (v: string) => void;
  accent: "indigo" | "purple";
}) {
  const ring =
    accent === "indigo"
      ? "focus:border-indigo-500 focus:ring-indigo-500"
      : "focus:border-purple-500 focus:ring-purple-500";
  const badge =
    accent === "indigo"
      ? "bg-indigo-500/15 text-indigo-400"
      : "bg-purple-500/15 text-purple-400";

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-slate-300 text-sm font-medium">{label}</label>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${badge}`}>
          {teamLabel}
        </span>
      </div>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className={`w-full bg-slate-800 border border-slate-700 ${ring} focus:ring-1 rounded-lg px-3 py-2.5 text-lg font-mono text-slate-100 placeholder-slate-600 outline-none transition-colors`}
      />
    </div>
  );
}

