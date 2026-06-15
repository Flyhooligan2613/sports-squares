/** Official branding for The Square Drop™ — SquareBoards flagship reward experience. */

export const SQUARE_DROP_NAME = "The Square Drop";
export const SQUARE_DROP_TAGLINE = "Your weekly reward ritual";
export const SQUARE_DROP_READY = "Your Square Drop is Ready!";
export const SQUARE_DROP_EMOJI = "🎁";

/** Public-facing homepage / marketing name (internal routes may still use square-drop). */
export const WEEKLY_REWARD_DROP_PUBLIC_NAME = "Weekly Reward Drop";
export const WEEKLY_REWARD_DROP_EMOJI = SQUARE_DROP_EMOJI;
export const WEEKLY_REWARD_DROP_PUBLIC_DESC =
  "Earn rewards every week through gameplay, referrals, VIP promotions, and achievements.";

export const DROP_TIER_LABELS = {
  bronze: "Bronze Drop",
  silver: "Silver Drop",
  gold: "Gold Drop",
  diamond: "Diamond Drop",
  legend: "Legend Drop",
  immortal: "Immortal Drop",
} as const;

export const RARITY_LABELS = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  mythic: "Mythic",
  immortal: "Immortal",
} as const;

export const MY_REWARDS_NAME = "My Rewards";

export const REWARDS_CENTER_SECTIONS = [
  { href: "/my-games/rewards", label: "Overview", icon: "📊", exact: true },
  { href: "/my-games/rewards/gift-shop", label: "Gift Shop", icon: "🎀" },
  { href: "/my-games/rewards/credit-shop", label: "Credit Shop", icon: "💎" },
  { href: "/my-games/rewards/tier", label: "Tier Progress", icon: "⭐" },
  { href: "/my-games/rewards/square-drop", label: "Square Drop", icon: "🎁" },
  { href: "/my-games/rewards/inventory", label: "Inventory", icon: "🎒" },
  { href: "/my-games/rewards/achievements", label: "Achievements", icon: "🏆" },
  { href: "/my-games/rewards/upcoming", label: "Upcoming", icon: "📅" },
  { href: "/my-games/rewards/credits", label: "My Credits", icon: "💰" },
  { href: "/my-games/rewards/history", label: "History", icon: "📜" },
] as const;
