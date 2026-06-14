"use client";

import { useMemo } from "react";
import { useLandingLive } from "@/components/landing/LandingLiveProvider";
import HomeLiveActivityFeed from "@/components/landing/HomeLiveActivityFeed";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { buildHomePulseStats } from "@/lib/landing/homePulseStats";
import { useCountUp } from "@/lib/motion/useCountUp";

function PulseStatCard({
  emoji,
  value,
  label,
  live,
  active,
  delay,
}: {
  emoji: string;
  value: string;
  label: string;
  live?: boolean;
  active: boolean;
  delay: number;
}) {
  const numeric = Number(value.replace(/[^0-9.]/g, ""));
  const isNumeric = !Number.isNaN(numeric) && /^[\d,.$]+[KMB]?$/.test(value.replace(/,/g, ""));
  const animated = useCountUp(isNumeric ? numeric : 0, active && isNumeric, {
    duration: 1100,
    delay,
  });

  const display = isNumeric
    ? value.startsWith("$")
      ? `$${animated.toLocaleString("en-US")}${value.includes("M") ? "M" : value.includes("K") ? "K" : ""}`
      : animated.toLocaleString("en-US")
    : value;

  return (
    <div className="home-pulse-stat sb-card-interactive">
      {live ? <span className="home-pulse-stat-live" aria-hidden /> : null}
      <span className="home-pulse-stat-emoji" aria-hidden>
        {emoji}
      </span>
      <p className="home-pulse-stat-value">{display}</p>
      <p className="home-pulse-stat-label">{label}</p>
    </div>
  );
}

function PulseSkeleton() {
  return (
    <div className="home-pulse-stat">
      <Skeleton className="sb-xp-skeleton h-8 w-8 rounded-lg mx-auto mb-3" />
      <Skeleton className="sb-xp-skeleton h-9 w-20 mx-auto mb-2" />
      <Skeleton className="sb-xp-skeleton h-3 w-28 mx-auto" />
    </div>
  );
}

export default function HomeHappeningNow() {
  const { data, loading } = useLandingLive();
  const pulseStats = useMemo(() => buildHomePulseStats(data), [data]);

  return (
    <LandingSection variant="glow" className="home-happening-now">
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="Live Activity"
          title="Happening Right Now"
          subtitle="Real players. Live games. Cash prizes moving every quarter."
          align="center"
        />
      </ScrollReveal>

      <ScrollReveal delay={60}>
        <div className="home-pulse-grid" aria-live="polite" aria-atomic="false">
          {loading && pulseStats.length === 0
            ? Array.from({ length: 4 }).map((_, index) => <PulseSkeleton key={index} />)
            : pulseStats.map((stat, index) => (
                <PulseStatCard
                  key={stat.id}
                  emoji={stat.emoji}
                  value={stat.value}
                  label={stat.label}
                  live={stat.live}
                  active
                  delay={index * 80}
                />
              ))}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={120}>
        <HomeLiveActivityFeed />
      </ScrollReveal>
    </LandingSection>
  );
}
