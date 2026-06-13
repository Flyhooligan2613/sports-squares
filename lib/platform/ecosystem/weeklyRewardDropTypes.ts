import type { PlayerTierSlug } from "@/lib/platform/ecosystem/types";
import { DROP_TIER_LABELS, RARITY_LABELS } from "@/lib/platform/ecosystem/squareDropBrand";

export type RewardRarity = "common" | "rare" | "epic" | "legendary" | "mythic" | "immortal";

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
  | "reward_token"
  | "square_credit"
  | "pickem_credit"
  | "bonus_entry"
  | "bonus_square"
  | "referral_bonus"
  | "coupon"
  | "merch_credit"
  | "store_credit"
  | "badge"
  | "vip_ticket"
  | "vip_pass"
  | "profile_frame"
  | "animated_avatar"
  | "profile_theme"
  | "name_color"
  | "username_effect"
  | "emoji_pack"
  | "player_title"
  | "season_token"
  | "giveaway_ticket"
  | "holiday_reward"
  | "mystery_reward"
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
  immortal: number;
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
  common: { border: "#94a3b8", glow: "rgba(148,163,184,0.4)", text: "text-slate-300", label: RARITY_LABELS.common },
  rare: { border: "#38bdf8", glow: "rgba(56,189,248,0.5)", text: "text-sky-300", label: RARITY_LABELS.rare },
  epic: { border: "#a855f7", glow: "rgba(168,85,247,0.55)", text: "text-purple-300", label: RARITY_LABELS.epic },
  legendary: { border: "#eab308", glow: "rgba(234,179,8,0.6)", text: "text-yellow-300", label: RARITY_LABELS.legendary },
  mythic: { border: "#f472b6", glow: "rgba(244,114,182,0.6)", text: "text-pink-300", label: RARITY_LABELS.mythic },
  immortal: { border: "#f97316", glow: "rgba(249,115,22,0.75)", text: "text-orange-300", label: RARITY_LABELS.immortal },
};

export const BOX_VISUALS: Record<
  DropBoxType,
  { label: string; gradient: string; glow: string; emoji: string }
> = {
  bronze: { label: DROP_TIER_LABELS.bronze, gradient: "from-amber-700/60 to-amber-900/40", glow: "#b45309", emoji: "🥉" },
  silver: { label: DROP_TIER_LABELS.silver, gradient: "from-slate-300/50 to-slate-500/30", glow: "#94a3b8", emoji: "🥈" },
  gold: { label: DROP_TIER_LABELS.gold, gradient: "from-yellow-400/50 to-amber-600/40", glow: "#eab308", emoji: "🥇" },
  diamond: { label: DROP_TIER_LABELS.diamond, gradient: "from-cyan-300/50 to-blue-500/40", glow: "#22d3ee", emoji: "💎" },
  legend: { label: DROP_TIER_LABELS.legend, gradient: "from-purple-400/50 to-violet-700/40", glow: "#a855f7", emoji: "👑" },
  immortal: { label: DROP_TIER_LABELS.immortal, gradient: "from-red-400/50 to-purple-800/50", glow: "#ef4444", emoji: "🔥" },
};
