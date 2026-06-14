"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";

interface SurvivorStayInGamePanelProps {
  variant: "eliminated" | "champion";
  weeksSurvived: number;
  shieldUsedWeek: number | null;
  displayName: string;
}

const LINKS = [
  { label: "Play Pick'em", href: "/pickem/week", emoji: "🎯" },
  { label: "Browse Squares", href: "/games/nfl", emoji: "🏈" },
  { label: "The Huddle", href: "/huddle", emoji: "💬" },
  { label: "Rewards Center", href: "/my-games/rewards", emoji: "🎁" },
] as const;

export default function SurvivorStayInGamePanel({
  variant,
  weeksSurvived,
  shieldUsedWeek,
  displayName,
}: SurvivorStayInGamePanelProps) {
  const isChampion = variant === "champion";

  return (
    <LandingGlassCard
      className={`p-6 sm:p-8 mb-6 ${
        isChampion
          ? "border-amber-400/40 ring-1 ring-amber-400/20"
          : "border-violet-400/25"
      }`}
    >
      <div className="text-center max-w-lg mx-auto">
        <p className="text-4xl mb-3" aria-hidden>
          {isChampion ? "👑" : "🌅"}
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          {isChampion
            ? `${displayName}, you survived the season!`
            : "Your Survivor run ended — the season keeps going"}
        </h2>
        <p className="text-sm text-sb-muted leading-relaxed mb-4">
          {isChampion
            ? "Champion crowned. Your legacy is permanent — keep building it across the platform."
            : "You earned tier credits for your run. Follow the live map, cheer friends on, and jump into Pick'em, Squares, and Reward Drops."}
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-6 text-sm">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white">
            <span className="text-sb-muted">Weeks survived </span>
            <span className="font-bold font-mono">{weeksSurvived}</span>
          </span>
          {shieldUsedWeek ? (
            <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-violet-200">
              🛡️ Shield used Week {shieldUsedWeek}
            </span>
          ) : !isChampion ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sb-muted">
              Shield unused
            </span>
          ) : null}
        </div>

        <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-3">
          Never stand still
        </p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {LINKS.map((link) => (
            <Button
              key={link.href}
              href={link.href}
              variant="secondary"
              className="justify-center text-sm"
            >
              <span aria-hidden>{link.emoji}</span>
              {link.label}
            </Button>
          ))}
        </div>

        {!isChampion ? (
          <p className="text-xs text-sb-muted mt-5">
            Watch the Live Survival Map below — see who&apos;s still standing each week.
          </p>
        ) : (
          <Button href="/survivor/hall-of-fame" className="mt-5">
            View Hall of Fame
          </Button>
        )}
      </div>
    </LandingGlassCard>
  );
}
