"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Grid3X3, Radio } from "lucide-react";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import MarketplaceSportBar, {
  type MarketplaceSportFilter,
} from "@/components/marketplace/MarketplaceSportBar";
import SportOffSeasonPanel from "@/components/marketplace/SportOffSeasonPanel";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getEspnSportConfig } from "@/lib/espn/sports";
import {
  getMarketplaceSeasonStatus,
  isMarketplaceOffSeason,
} from "@/lib/marketplace/seasonStatus";
import type { EspnSport, MarketplaceSportStats } from "@/lib/types";
import { Button } from "@/components/ui/Button";

function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

function parseSportParam(value: string | null): MarketplaceSportFilter {
  if (
    value === "nfl" ||
    value === "ncaaf" ||
    value === "nba" ||
    value === "ncaab" ||
    value === "mlb"
  ) {
    return value;
  }
  return "all";
}

export default function MarketplaceSports() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<MarketplaceSportStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<MarketplaceSportFilter>(() =>
    parseSportParam(searchParams.get("sport"))
  );

  useEffect(() => {
    fetch("/api/marketplace/stats")
      .then((res) => res.json())
      .then((data) => setStats(data.sports ?? []))
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSelectedSport(parseSportParam(searchParams.get("sport")));
  }, [searchParams]);

  const selectSport = useCallback(
    (sport: MarketplaceSportFilter) => {
      setSelectedSport(sport);
      const params = new URLSearchParams(searchParams.toString());
      if (sport === "all") {
        params.delete("sport");
      } else {
        params.set("sport", sport);
      }
      const query = params.toString();
      router.replace(query ? `/?${query}#marketplace` : "/#marketplace", { scroll: false });
    },
    [router, searchParams]
  );

  const visibleStats = useMemo(() => {
    if (selectedSport === "all") return stats;
    return stats.filter((row) => row.sport === selectedSport);
  }, [stats, selectedSport]);

  const selectedConfig =
    selectedSport !== "all" ? getEspnSportConfig(selectedSport as EspnSport) : null;

  const selectedOffSeason =
    selectedSport !== "all" && isMarketplaceOffSeason(selectedSport as EspnSport);

  const selectedSeasonStatus =
    selectedSport !== "all"
      ? getMarketplaceSeasonStatus(selectedSport as EspnSport)
      : null;

  return (
    <LandingSection id="marketplace" scrollMargin variant="alt">
      <ScrollReveal>
        <LandingSectionHeader
          className="landing-section-header-glow"
          eyebrow="Marketplace"
          title="Browse games and buy squares"
          subtitle="SquareBoards creates and manages every board automatically. Pick a sport, choose a game, and play."
        />
      </ScrollReveal>

      <ScrollReveal delay={40}>
        <MarketplaceSportBar
          selected={selectedSport}
          onSelect={selectSport}
          stats={loading ? undefined : stats}
          className="mb-6 sm:mb-8"
        />
      </ScrollReveal>

      {selectedConfig ? (
        <ScrollReveal delay={60}>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-sb-muted">
              {selectedOffSeason ? (
                <>
                  <span className="text-white font-semibold">{selectedConfig.label}</span>
                  {" · "}
                  {selectedSeasonStatus?.headline ?? "Off season"}
                </>
              ) : (
                <>
                  Showing{" "}
                  <span className="text-white font-semibold">{selectedConfig.label}</span>{" "}
                  boards and open games.
                </>
              )}
            </p>
            <Button href={`/games/${selectedSport}`} variant="secondary" className="shrink-0">
              {selectedOffSeason
                ? `Visit ${selectedConfig.label} Squares`
                : `Browse all ${selectedConfig.label} games`}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </ScrollReveal>
      ) : null}

      {selectedOffSeason ? (
        <ScrollReveal delay={80}>
          <SportOffSeasonPanel sport={selectedSport as EspnSport} className="mb-6" />
        </ScrollReveal>
      ) : null}

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 landing-skeleton" />
          ))}
        </div>
      ) : selectedOffSeason ? null : visibleStats.length === 0 ? (
        <div className="landing-glass-card text-center py-14 px-6">
          <p className="text-white font-semibold text-lg mb-2">No games listed yet</p>
          <p className="text-sb-muted text-sm max-w-md mx-auto mb-5">
            {selectedConfig
              ? `${selectedConfig.label} games sync automatically from live schedules. Try another sport or check back soon.`
              : "Games sync automatically from live schedules. Check back soon."}
          </p>
          {selectedSport !== "all" ? (
            <button
              type="button"
              className="text-sm font-semibold text-sb-glow hover:text-white transition-colors"
              onClick={() => selectSport("all")}
            >
              View all sports
            </button>
          ) : null}
        </div>
      ) : (
        <div
          className={[
            "grid gap-4 sm:gap-5",
            visibleStats.length === 1 ? "grid-cols-1 max-w-2xl" : "sm:grid-cols-2",
          ].join(" ")}
        >
          {visibleStats.map((sport, index) => {
            const offSeason = isMarketplaceOffSeason(sport.sport);
            const season = getMarketplaceSeasonStatus(sport.sport);

            if (offSeason) {
              return (
                <ScrollReveal key={sport.sport} delay={index * 60}>
                  <Link
                    href={`/games/${sport.sport}`}
                    className="landing-glass-card block p-6 sm:p-7 h-full group hover:border-sb-purple/40 transition-colors sport-offseason-card"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-sb-glow font-semibold mb-1">
                          {sport.label}
                        </p>
                        <h3 className="text-xl font-bold text-white group-hover:text-sb-glow transition-colors">
                          {season.headline}
                        </h3>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-sb-muted/10 border border-sb-muted/25 text-sb-muted text-[10px] font-bold uppercase">
                        Off season
                      </span>
                    </div>
                    <p className="text-sm text-sb-muted leading-relaxed mb-5">
                      {season.message}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-sb-glow">
                      Visit {sport.label} Squares
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </ScrollReveal>
              );
            }

            return (
            <ScrollReveal key={sport.sport} delay={index * 60}>
              <Link
                href={`/games/${sport.sport}`}
                className="landing-glass-card block p-6 sm:p-7 h-full group hover:border-sb-purple/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-sb-glow font-semibold mb-1">
                      {sport.label}
                    </p>
                    <h3 className="text-xl font-bold text-white group-hover:text-sb-glow transition-colors">
                      {sport.gameCount > 0
                        ? `${sport.gameCount} game${sport.gameCount === 1 ? "" : "s"} available`
                        : "Games syncing soon"}
                    </h3>
                  </div>
                  {sport.gameCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-sb-success/15 border border-sb-success/30 text-sb-success text-[10px] font-bold uppercase">
                      <Radio className="w-3 h-3" />
                      Live
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                  <div>
                    <p className="text-sb-muted text-xs mb-1">Open boards</p>
                    <p className="text-white font-bold font-mono">
                      {formatCount(sport.openBoardCount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sb-muted text-xs mb-1">Squares available</p>
                    <p className="text-white font-bold font-mono inline-flex items-center gap-1.5">
                      <Grid3X3 className="w-3.5 h-3.5 text-sb-glow" />
                      {formatCount(sport.squaresAvailable)}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-sm font-semibold text-sb-glow">
                  Browse {sport.label}
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </ScrollReveal>
            );
          })}
        </div>
      )}
    </LandingSection>
  );
}
