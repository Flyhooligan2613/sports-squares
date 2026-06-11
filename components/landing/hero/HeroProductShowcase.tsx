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
      <div className="hero-board-bloom" aria-hidden />

      <div className="hero-showcase-product-col">
        <HeroScoreboard pool={pool} liveGame={liveGame} />

        <div className="hero-board-stage-wrap hero-board-interactive">
          <HeroFloatingBoard pool={pool} />
        </div>

        <HeroStatCards pool={pool} loading={loading} />
      </div>
    </div>
  );
}
