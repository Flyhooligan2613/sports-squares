import type { LiveActivityCategory, LiveActivityEventType } from "@/lib/liveActivity/types";

const CATEGORY_BY_TYPE: Record<LiveActivityEventType, LiveActivityCategory> = {
  quarter_winner: "winners",
  game_winner: "winners",
  jackpot: "winners",
  large_payout: "winners",
  square_drop: "rewards",
  xp: "rewards",
  tier_promotion: "rewards",
  achievement: "rewards",
  badge: "rewards",
  follower: "community",
  referral: "community",
  pick_card: "community",
  trending_pick: "community",
  new_user: "community",
  new_board: "marketplace",
  board_filled: "marketplace",
  game_starting: "marketplace",
  squares_remaining: "marketplace",
  players_online: "platform",
  paid_today: "platform",
  open_boards: "platform",
  squares_sold: "platform",
  payouts_processed: "platform",
  game_live: "platform",
  pickem_streak: "winners",
};

const BASE_PRIORITY: Partial<Record<LiveActivityEventType, number>> = {
  jackpot: 95,
  large_payout: 90,
  square_drop: 88,
  tier_promotion: 86,
  badge: 84,
  quarter_winner: 82,
  game_winner: 80,
  referral: 78,
  board_filled: 70,
  game_live: 68,
  pickem_streak: 65,
  achievement: 62,
  new_user: 58,
  pick_card: 55,
  follower: 52,
  trending_pick: 50,
  payouts_processed: 48,
  paid_today: 46,
  players_online: 44,
  squares_sold: 42,
  open_boards: 40,
  new_board: 38,
  game_starting: 36,
  squares_remaining: 34,
  xp: 30,
};

const HIGH_TIER_KEYWORDS = ["legend", "immortal", "diamond"];
const HIGH_PAYOUT_CENTS = 100_000;

export function resolveCategory(type: LiveActivityEventType): LiveActivityCategory {
  return CATEGORY_BY_TYPE[type];
}

export function computePriority(
  type: LiveActivityEventType,
  opts?: {
    amountCents?: number;
    tier?: string;
    priority?: number;
    isCelebration?: boolean;
  }
): number {
  if (typeof opts?.priority === "number") return opts.priority;

  let score = BASE_PRIORITY[type] ?? 45;

  const tier = opts?.tier?.toLowerCase() ?? "";
  if (HIGH_TIER_KEYWORDS.some((key) => tier.includes(key))) {
    score = Math.max(score, 92);
  }

  if (typeof opts?.amountCents === "number" && opts.amountCents >= HIGH_PAYOUT_CENTS) {
    score = Math.max(score, 94);
  }

  if (opts?.isCelebration) {
    score = Math.max(score, 96);
  }

  return score;
}

export function shouldCelebrate(opts: {
  type: LiveActivityEventType;
  amountCents?: number;
  tier?: string;
  isCelebration?: boolean;
}): boolean {
  if (opts.isCelebration) return true;
  const tier = opts.tier?.toLowerCase() ?? "";
  if (tier.includes("diamond") || tier.includes("legend") || tier.includes("immortal")) {
    return true;
  }
  if (typeof opts.amountCents === "number" && opts.amountCents >= HIGH_PAYOUT_CENTS) {
    return true;
  }
  if (opts.type === "jackpot") return true;
  return false;
}

export function formatMoney(amount: number | string | undefined): string | undefined {
  if (amount == null) return undefined;
  if (typeof amount === "string") return amount.startsWith("$") ? amount : `$${amount}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseAmountCents(
  amount?: number | string,
  amountCents?: number
): number | undefined {
  if (typeof amountCents === "number") return amountCents;
  if (typeof amount === "number") return Math.round(amount * 100);
  if (typeof amount === "string") {
    const digits = amount.replace(/[^\d.]/g, "");
    const parsed = Number(digits);
    if (!Number.isFinite(parsed)) return undefined;
    return Math.round(parsed * 100);
  }
  return undefined;
}
