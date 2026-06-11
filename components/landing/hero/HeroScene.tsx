"use client";

import HeroBackground from "@/components/landing/hero/HeroBackground";
import HeroFloatingBoard from "@/components/landing/hero/HeroFloatingBoard";
import HeroScoreboard from "@/components/landing/hero/HeroScoreboard";
import HeroStatCards from "@/components/landing/hero/HeroStatCards";
import type { EspnLiveGame, Pool } from "@/lib/types";

interface HeroSceneProps {
  pool: Pool | null;
  liveGame: EspnLiveGame | null;
  loading?: boolean;
}

export default function HeroScene({ pool, liveGame, loading }: HeroSceneProps) {
  return (
    <div className="hero-scene relative">
      {/* Scene-local atmosphere */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_60%,rgba(91,76,247,0.2),transparent_65%)] pointer-events-none"
        aria-hidden
      />

      <div className="hero-scene-inner">
        <HeroScoreboard pool={pool} liveGame={liveGame} />

        <div className="hero-board-container">
          <HeroFloatingBoard pool={pool} />
        </div>

        <HeroStatCards pool={pool} loading={loading} />
      </div>

      {/* Local particles */}
      <div className="hero-scene-particles" aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="hero-scene-particle"
            style={{
              left: `${10 + i * 11}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${4 + (i % 3)}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export { HeroBackground };
