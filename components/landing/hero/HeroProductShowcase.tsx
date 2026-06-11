"use client";

import HeroFloatingBoard from "@/components/landing/hero/HeroFloatingBoard";
import HeroScoreboard from "@/components/landing/hero/HeroScoreboard";
import HeroStatCards from "@/components/landing/hero/HeroStatCards";
import type { EspnLiveGame, Pool } from "@/lib/types";

interface HeroProductShowcaseProps {
  pool: Pool | null;
  liveGame: EspnLiveGame | null;
  loading?: boolean;
}

export default function HeroProductShowcase({
  pool,
  liveGame,
  loading,
}: HeroProductShowcaseProps) {
  return (
    <div className="hero-product-showcase">
      {/* Top spotlight */}
      <div className="hero-spotlight-beam" aria-hidden />
      <div className="hero-board-bloom" aria-hidden />

      <div className="hero-showcase-stack">
        <HeroScoreboard pool={pool} liveGame={liveGame} />

        <div className="hero-showcase-connector" aria-hidden>
          <span className="hero-showcase-connector-line" />
          <span className="hero-showcase-connector-glow" />
        </div>

        <div className="hero-board-stage-wrap hero-board-interactive">
          <HeroFloatingBoard pool={pool} />
        </div>

        <HeroStatCards pool={pool} loading={loading} />
      </div>

      {/* Ambient dust */}
      <div className="hero-showcase-dust" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="hero-dust-particle"
            style={{
              left: `${8 + i * 7.5}%`,
              animationDelay: `${i * 0.55}s`,
              animationDuration: `${5 + (i % 4) * 1.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
