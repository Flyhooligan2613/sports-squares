import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getEspnSportConfig } from "@/lib/espn/sports";
import { getMarketplaceSeasonStatus } from "@/lib/marketplace/seasonStatus";
import type { EspnSport } from "@/lib/types";

const SPORT_EMOJI: Record<EspnSport, string> = {
  nfl: "🏈",
  ncaaf: "🏈",
  nba: "🏀",
  ncaab: "🏀",
  mlb: "⚾",
};

interface SportOffSeasonPanelProps {
  sport: EspnSport;
  className?: string;
  showBrowseOther?: boolean;
}

export default function SportOffSeasonPanel({
  sport,
  className = "",
  showBrowseOther = true,
}: SportOffSeasonPanelProps) {
  const config = getEspnSportConfig(sport);
  const season = getMarketplaceSeasonStatus(sport);

  return (
    <div
      className={`landing-glass-card text-center py-14 sm:py-16 px-6 sport-offseason-panel ${className}`.trim()}
    >
      <p className="text-4xl mb-4" aria-hidden>
        {SPORT_EMOJI[sport]}
      </p>
      <p className="text-xs uppercase tracking-wider text-sb-muted font-semibold mb-2">
        {config.label} Squares
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
        {season.headline}
      </h2>
      <p className="text-sb-muted text-sm max-w-lg mx-auto leading-relaxed mb-2">
        {season.message}
      </p>
      {season.returnHint ? (
        <p className="text-xs text-sb-muted/80 max-w-md mx-auto mb-6">
          {season.returnHint}
        </p>
      ) : (
        <div className="mb-6" />
      )}
      {showBrowseOther ? (
        <Link
          href="/#marketplace"
          className="inline-flex items-center gap-1 text-sm font-semibold text-sb-glow hover:text-white transition-colors"
        >
          Browse other sports
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : null}
    </div>
  );
}
