"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Grid3X3, Radio } from "lucide-react";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { MarketplaceSportStats } from "@/lib/types";

function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

export default function MarketplaceSports() {
  const [stats, setStats] = useState<MarketplaceSportStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/marketplace/stats")
      .then((res) => res.json())
      .then((data) => setStats(data.sports ?? []))
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <LandingSection id="marketplace" scrollMargin variant="alt">
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="Marketplace"
          title="Browse games and buy squares"
          subtitle="SquareBoards creates and manages every board automatically. Pick a sport, choose a game, and play."
        />
      </ScrollReveal>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 landing-skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {stats.map((sport, index) => (
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
          ))}
        </div>
      )}
    </LandingSection>
  );
}
