"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { PickemGameView, PickemSide } from "@/lib/pickem/types";
import {
  PICKEM_MNF_COMBINED_SCORE_HINT,
  PICKEM_MNF_COMBINED_SCORE_LABEL,
} from "@/lib/pickem/copy";
import { validateCombinedScoreInput } from "@/lib/pickem/mnfCombinedScoreStorage";

interface PickemGameCardProps {
  game: PickemGameView;
  saving?: boolean;
  disabled?: boolean;
  onPick?: (gameId: string, side: PickemSide) => void;
  onCombinedTotalChange?: (gameId: string, total: number) => void;
  combinedTotalError?: string | null;
}

function formatKickoff(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function stateClass(state: PickemGameView["resultState"]): string {
  switch (state) {
    case "correct":
      return "pickem-game-card-correct";
    case "incorrect":
      return "pickem-game-card-incorrect";
    case "locked":
    case "unpicked":
      return "pickem-game-card-locked";
    default:
      return "";
  }
}

function TeamButton({
  side,
  label,
  abbr,
  record,
  logoUrl,
  selected,
  disabled,
  onClick,
}: {
  side: PickemSide;
  label: string;
  abbr: string | null;
  record: string | null;
  logoUrl: string | null;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "pickem-team-btn",
        selected ? "pickem-team-btn-selected" : "",
        disabled ? "pickem-team-btn-disabled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-pressed={selected}
      aria-label={`Pick ${label}`}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt=""
          width={40}
          height={40}
          className="pickem-team-logo"
          unoptimized
        />
      ) : (
        <span className="pickem-team-logo-fallback">{abbr ?? side[0].toUpperCase()}</span>
      )}
      <span className="pickem-team-name">{label}</span>
      {record ? <span className="pickem-team-record">{record}</span> : null}
    </button>
  );
}

export default function PickemGameCard({
  game,
  saving,
  disabled: entryLocked = false,
  onPick,
  onCombinedTotalChange,
  combinedTotalError,
}: PickemGameCardProps) {
  const locked = game.picksLocked || new Date(game.kickoffAt).getTime() <= Date.now();
  const live = game.status === "live";
  const final = game.status === "final";
  const disabled = locked || saving === true || entryLocked || !onPick;
  const requiresCombinedTotal = game.isMondayNight;
  const combinedDisabled =
    locked || saving === true || entryLocked || !onCombinedTotalChange;

  const [combinedInput, setCombinedInput] = useState(
    game.predictedCombinedTotal != null ? String(game.predictedCombinedTotal) : ""
  );
  const [localCombinedError, setLocalCombinedError] = useState<string | null>(null);

  useEffect(() => {
    setCombinedInput(
      game.predictedCombinedTotal != null ? String(game.predictedCombinedTotal) : ""
    );
  }, [game.predictedCombinedTotal, game.id]);

  function handleCombinedBlur() {
    if (!requiresCombinedTotal || !onCombinedTotalChange) return;
    const trimmed = combinedInput.trim();
    if (!trimmed) {
      setLocalCombinedError(null);
      return;
    }
    const result = validateCombinedScoreInput(trimmed);
    if (!result.valid || result.value == null) {
      setLocalCombinedError(result.error ?? "Invalid combined score.");
      return;
    }
    setLocalCombinedError(null);
    onCombinedTotalChange(game.id, result.value);
  }

  const showCombinedError = combinedTotalError ?? localCombinedError;
  const combinedComplete = game.predictedCombinedTotal != null;

  return (
    <article
      className={[
        "pickem-game-card landing-glass-card",
        stateClass(game.resultState),
        live ? "pickem-game-card-live" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="pickem-game-card-header">
        <div>
          <p className="pickem-game-kickoff">{formatKickoff(game.kickoffAt)}</p>
          {live ? (
            <span className="pickem-live-pill">Live</span>
          ) : final ? (
            <span className="pickem-final-pill">Final</span>
          ) : locked ? (
            <span className="pickem-locked-pill">Locked</span>
          ) : null}
        </div>
        {final && game.awayScore != null && game.homeScore != null ? (
          <p className="pickem-game-score">
            {game.awayScore} – {game.homeScore}
          </p>
        ) : null}
      </div>

      <div className="pickem-game-matchup">
        <TeamButton
          side="away"
          label={game.awayTeam}
          abbr={game.awayAbbr}
          record={game.awayRecord}
          logoUrl={game.awayLogoUrl}
          selected={game.userPick === "away"}
          disabled={disabled}
          onClick={() => onPick?.(game.id, "away")}
        />
        <span className="pickem-game-at">@</span>
        <TeamButton
          side="home"
          label={game.homeTeam}
          abbr={game.homeAbbr}
          record={game.homeRecord}
          logoUrl={game.homeLogoUrl}
          selected={game.userPick === "home"}
          disabled={disabled}
          onClick={() => onPick?.(game.id, "home")}
        />
      </div>

      {requiresCombinedTotal ? (
        <div className="pickem-combined-score mt-4 pt-4 border-t border-white/[0.08]">
          <label
            htmlFor={`pickem-combined-${game.id}`}
            className="pickem-combined-score-label"
          >
            {PICKEM_MNF_COMBINED_SCORE_LABEL}
            <span className="pickem-combined-score-required" aria-hidden>
              *
            </span>
          </label>
          <p className="pickem-combined-score-hint">{PICKEM_MNF_COMBINED_SCORE_HINT}</p>
          <div className="pickem-combined-score-row">
            <input
              id={`pickem-combined-${game.id}`}
              type="number"
              inputMode="numeric"
              step={1}
              min={0}
              max={200}
              required
              value={combinedInput}
              disabled={combinedDisabled}
              onChange={(e) => {
                setCombinedInput(e.target.value);
                if (localCombinedError) setLocalCombinedError(null);
              }}
              onBlur={handleCombinedBlur}
              className={[
                "pickem-combined-score-input",
                showCombinedError ? "pickem-combined-score-input--error" : "",
                combinedComplete ? "pickem-combined-score-input--saved" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              placeholder="e.g. 56"
              aria-invalid={showCombinedError ? true : undefined}
              aria-describedby={
                showCombinedError ? `pickem-combined-error-${game.id}` : undefined
              }
            />
            {combinedComplete ? (
              <span className="pickem-combined-score-saved">Saved</span>
            ) : null}
          </div>
          {showCombinedError ? (
            <p
              id={`pickem-combined-error-${game.id}`}
              className="pickem-combined-score-error"
              role="alert"
            >
              {showCombinedError}
            </p>
          ) : null}
          {game.status === "final" &&
          game.awayScore != null &&
          game.homeScore != null ? (
            <p className="pickem-combined-score-actual">
              Actual combined score: {game.awayScore + game.homeScore}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
