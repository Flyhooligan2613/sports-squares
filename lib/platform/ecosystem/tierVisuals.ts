import type { PlayerTierSlug } from "@/lib/platform/ecosystem/types";

export interface TierVisual {
  slug: PlayerTierSlug;
  icon: string;
  color: string;
  gradient: string;
  frameClass: string;
}

export const TIER_VISUALS: Record<PlayerTierSlug, TierVisual> = {
  rookie: {
    slug: "rookie",
    icon: "🌱",
    color: "#94a3b8",
    gradient: "from-slate-500/30 to-slate-700/10",
    frameClass: "tier-frame-rookie",
  },
  contender: {
    slug: "contender",
    icon: "⚔️",
    color: "#38bdf8",
    gradient: "from-sky-500/30 to-blue-700/10",
    frameClass: "tier-frame-contender",
  },
  "all-star": {
    slug: "all-star",
    icon: "⭐",
    color: "#a855f7",
    gradient: "from-purple-500/35 to-violet-800/10",
    frameClass: "tier-frame-all-star",
  },
  champion: {
    slug: "champion",
    icon: "🏅",
    color: "#f59e0b",
    gradient: "from-amber-500/35 to-orange-800/10",
    frameClass: "tier-frame-champion",
  },
  elite: {
    slug: "elite",
    icon: "💎",
    color: "#22d3ee",
    gradient: "from-cyan-400/35 to-teal-800/10",
    frameClass: "tier-frame-elite",
  },
  legend: {
    slug: "legend",
    icon: "👑",
    color: "#eab308",
    gradient: "from-yellow-400/40 to-amber-900/15",
    frameClass: "tier-frame-legend",
  },
  "hall-of-fame": {
    slug: "hall-of-fame",
    icon: "🐐",
    color: "#f97316",
    gradient: "from-orange-500/40 to-red-900/15",
    frameClass: "tier-frame-hof",
  },
  immortal: {
    slug: "immortal",
    icon: "🔥",
    color: "#ef4444",
    gradient: "from-red-500/45 to-purple-900/20",
    frameClass: "tier-frame-immortal",
  },
};

export function getTierVisual(slug: PlayerTierSlug): TierVisual {
  return TIER_VISUALS[slug] ?? TIER_VISUALS.rookie;
}

export function computeTierLevel(lifetimeCredits: number, tierMinCredits: number): number {
  const span = Math.max(1, lifetimeCredits - tierMinCredits);
  return Math.min(99, Math.floor(span / 40) + 1);
}

export function computeXpToNextTier(creditsToNext: number): number {
  return Math.max(0, creditsToNext);
}
