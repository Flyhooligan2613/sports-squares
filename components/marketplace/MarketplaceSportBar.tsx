"use client";

import { ESPN_SPORT_LIST } from "@/lib/espn/sports";
import { isMarketplaceOffSeason } from "@/lib/marketplace/seasonStatus";
import type { EspnSport, MarketplaceSportStats } from "@/lib/types";

export type MarketplaceSportFilter = EspnSport | "all";

const SPORT_EMOJI: Record<EspnSport, string> = {
  nfl: "🏈",
  ncaaf: "🏈",
  nba: "🏀",
  ncaab: "🏀",
  mlb: "⚾",
};

interface MarketplaceSportBarProps {
  selected: MarketplaceSportFilter;
  onSelect: (sport: MarketplaceSportFilter) => void;
  stats?: MarketplaceSportStats[];
  className?: string;
}

function gameCountFor(
  stats: MarketplaceSportStats[] | undefined,
  sport: EspnSport
): number {
  return stats?.find((row) => row.sport === sport)?.gameCount ?? 0;
}

export default function MarketplaceSportBar({
  selected,
  onSelect,
  stats,
  className = "",
}: MarketplaceSportBarProps) {
  const totalGames = stats?.reduce((sum, row) => sum + row.gameCount, 0) ?? 0;

  return (
    <div className={`marketplace-sport-bar ${className}`.trim()} role="tablist" aria-label="Sport">
      <button
        type="button"
        role="tab"
        aria-selected={selected === "all"}
        className={`marketplace-sport-chip ${selected === "all" ? "marketplace-sport-chip-active" : ""}`}
        onClick={() => onSelect("all")}
      >
        <span>All Sports</span>
        {stats && totalGames > 0 ? (
          <span className="marketplace-sport-chip-count">{totalGames}</span>
        ) : null}
      </button>

      {ESPN_SPORT_LIST.map((config) => {
        const count = gameCountFor(stats, config.id);
        const active = selected === config.id;
        const offSeason = isMarketplaceOffSeason(config.id);
        return (
          <button
            key={config.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`marketplace-sport-chip ${active ? "marketplace-sport-chip-active" : ""} ${offSeason ? "marketplace-sport-chip-offseason" : ""}`}
            onClick={() => onSelect(config.id)}
          >
            <span className="marketplace-sport-chip-emoji" aria-hidden>
              {SPORT_EMOJI[config.id]}
            </span>
            <span>{config.label}</span>
            {offSeason ? (
              <span className="marketplace-sport-chip-offseason-label">Off season</span>
            ) : stats && count > 0 ? (
              <span className="marketplace-sport-chip-count">{count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
