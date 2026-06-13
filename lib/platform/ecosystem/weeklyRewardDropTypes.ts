import type { PlayerTierSlug } from "@/lib/platform/ecosystem/types";

export type RewardRarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export type DropBoxType = "bronze" | "silver" | "gold" | "diamond" | "legend" | "immortal";

export type QualificationSource =
  | "weekly_gameplay"
  | "vip_promotion"
  | "referral_milestone"
  | "holiday"
  | "admin_giveaway"
  | "championship";

export type DropRewardType =
  | "tier_credits"
  | "square_credit"
  | "pickem_credit"
  | "bonus_entry"
  | "referral_bonus"
  | "coupon"
  | "merch_credit"
  | "badge"
  | "vip_ticket"
  | "profile_frame"
  | "animated_avatar"
  | "season_token"
  | "golden_box"
  | "diamond_box"
  | "legend_box"
  | "secret_reward";

export interface DropReward {
  id: string;
  type: DropRewardType;
  label: string;
  rarity: RewardRarity;
  amount?: number;
  valueCents?: number;
  icon: string;
  special?: boolean;
}

export interface DropRateTable {
  common: number;
  rare: number;
  epic: number;
  legendary: number;
  mythic: number;
}

export interface WeeklyRewardDropConfig {
  minWeeklyGameplayCents: number;
  enabled: boolean;
  dropRates: Record<DropBoxType, DropRateTable>;
  tierBoxMap: Record<PlayerTierSlug, DropBoxType>;
  specialSurpriseChancePct: number;
}

export interface WeeklyDropRecord {
  id: string;
  weekKey: string;
  boxType: DropBoxType;
  tierSlug: PlayerTierSlug;
  qualificationSource: QualificationSource;
  rewards: DropReward[];
  totalValueCents: number;
  openedAt: string | null;
  createdAt: string;
}

export interface WeeklyDropStatus {
  qualified: boolean;
  hasUnopenedDrop: boolean;
  currentDrop: WeeklyDropRecord | null;
  boxType: DropBoxType | null;
  qualificationSource: QualificationSource | null;
  weeklyGameplayCents: number;
  minGameplayCents: number;
  progressPct: number;
}

export const RARITY_COLORS: Record<RewardRarity, { border: string; glow: string; text: string; label: string }> = {
  common: { border: "#94a3b8", glow: "rgba(148,163,184,0.4)", text: "text-slate-300", label: "Common" },
  rare: { border: "#38bdf8", glow: "rgba(56,189,248,0.5)", text: "text-sky-300", label: "Rare" },
  epic: { border: "#a855f7", glow: "rgba(168,85,247,0.55)", text: "text-purple-300", label: "Epic" },
  legendary: { border: "#eab308", glow: "rgba(234,179,8,0.6)", text: "text-yellow-300", label: "Legendary" },
  mythic: { border: "#f472b6", glow: "rgba(244,114,182,0.6)", text: "text-pink-300", label: "Mythic" },
};

export const BOX_VISUALS: Record<
  DropBoxType,
  { label: string; gradient: string; glow: string; emoji: string }
> = {
  bronze: { label: "Bronze Box", gradient: "from-amber-700/60 to-amber-900/40", glow: "#b45309", emoji: "🥉" },
  silver: { label: "Silver Box", gradient: "from-slate-300/50 to-slate-500/30", glow: "#94a3b8", emoji: "🥈" },
  gold: { label: "Gold Box", gradient: "from-yellow-400/50 to-amber-600/40", glow: "#eab308", emoji: "🥇" },
  diamond: { label: "Diamond Box", gradient: "from-cyan-300/50 to-blue-500/40", glow: "#22d3ee", emoji: "💎" },
  legend: { label: "Legend Box", gradient: "from-purple-400/50 to-violet-700/40", glow: "#a855f7", emoji: "👑" },
  immortal: { label: "Immortal Box", gradient: "from-red-400/50 to-purple-800/50", glow: "#ef4444", emoji: "🔥" },
};
