"use client";

import Image from "next/image";
import type { PickemGameView, PickemSide } from "@/lib/pickem/types";

interface PickemGameCardProps {
  game: PickemGameView;
  saving?: boolean;
  disabled?: boolean;
  onPick?: (gameId: string, side: PickemSide) => void;
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
}: PickemGameCardProps) {
  const locked = game.picksLocked || new Date(game.kickoffAt).getTime() <= Date.now();
  const live = game.status === "live";
  const final = game.status === "final";
  const disabled = locked || saving === true || entryLocked || !onPick;

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
    </article>
  );
}
