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
      <div className="hero-product-unit">
        <div className="hero-product-unit-light" aria-hidden />
        <div className="hero-product-unit-glow" aria-hidden />

        <HeroScoreboard pool={pool} liveGame={liveGame} />

        <div className="hero-product-board-section hero-board-interactive">
          <div className="hero-product-ring" aria-hidden />
          <div className="hero-board-stage-wrap">
            <HeroFloatingBoard pool={pool} />
          </div>
        </div>

        <HeroStatCards pool={pool} loading={loading} />
      </div>
    </div>
  );
}
