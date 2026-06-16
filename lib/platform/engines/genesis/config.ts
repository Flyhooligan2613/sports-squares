import type {
  GenesisMissionDefinition,
  GenesisMissionId,
  GenesisStarterAchievementId,
  GenesisStarterAchievement,
} from "@/lib/platform/engines/genesis/types";

/** Every new competitor starts here — merit floor before first contest. */
export const GENESIS_STARTING_COMPETITOR_SCORE = 200;

/** Rookie Season length from account creation. */
export const ROOKIE_SEASON_DAYS = 30;

export const GENESIS_STARTER_ACHIEVEMENT_IDS: GenesisStarterAchievementId[] = [
  "genesis_welcome",
  "genesis_official_competitor",
  "genesis_account_created",
  "genesis_career_started",
  "genesis_profile_created",
];

export const GENESIS_STARTER_ACHIEVEMENTS: Record<
  GenesisStarterAchievementId,
  Omit<GenesisStarterAchievement, "unlockedAt">
> = {
  genesis_welcome: {
    id: "genesis_welcome",
    title: "Welcome to SquareBoards",
    description: "Your competitive journey begins here.",
    emoji: "👋",
  },
  genesis_official_competitor: {
    id: "genesis_official_competitor",
    title: "Official Competitor",
    description: "You're on the roster — welcome to the arena.",
    emoji: "🎖️",
  },
  genesis_account_created: {
    id: "genesis_account_created",
    title: "Account Created",
    description: "Your SquareBoards identity is live.",
    emoji: "✅",
  },
  genesis_career_started: {
    id: "genesis_career_started",
    title: "Career Started",
    description: "Rookie Season is underway — build your legacy.",
    emoji: "🚀",
  },
  genesis_profile_created: {
    id: "genesis_profile_created",
    title: "Profile Created",
    description: "Your Competitor Card is ready to grow.",
    emoji: "🪪",
  },
};

export const GENESIS_MISSIONS: GenesisMissionDefinition[] = [
  {
    id: "complete_profile",
    title: "Complete Profile",
    description: "Add your username and bio so competitors know you.",
    emoji: "📝",
    sortOrder: 1,
    xpReward: 100,
    rewards: [{ type: "xp", label: "100 XP", amount: 100 }],
  },
  {
    id: "join_first_contest",
    title: "Join First Contest",
    description: "Enter your first live board and join the competition.",
    emoji: "🏈",
    sortOrder: 2,
    xpReward: 250,
    rewards: [{ type: "xp", label: "250 XP", amount: 250 }],
    unlockAfter: ["complete_profile"],
  },
  {
    id: "follow_three_competitors",
    title: "Follow Three Competitors",
    description: "Build your network in The Huddle.",
    emoji: "👥",
    sortOrder: 3,
    xpReward: 0,
    rewards: [{ type: "badge", label: "Competitor Badge", itemId: "genesis_competitor_badge" }],
  },
  {
    id: "upload_profile_picture",
    title: "Upload Profile Picture",
    description: "Pick an avatar that represents your competitive style.",
    emoji: "🖼️",
    sortOrder: 4,
    xpReward: 0,
    rewards: [{ type: "avatar_frame", label: "Rookie Avatar Frame", itemId: "frame_rookie_genesis" }],
  },
  {
    id: "visit_trophy_room",
    title: "Visit Trophy Room",
    description: "See where your future championships will live.",
    emoji: "🏆",
    sortOrder: 5,
    xpReward: 50,
    rewards: [{ type: "xp", label: "50 XP", amount: 50 }],
  },
  {
    id: "open_community_feed",
    title: "Open Community Feed",
    description: "Explore The Huddle and see what competitors are sharing.",
    emoji: "💬",
    sortOrder: 6,
    xpReward: 25,
    rewards: [{ type: "xp", label: "25 XP", amount: 25 }],
  },
  {
    id: "view_todays_contests",
    title: "View Today's Contests",
    description: "Browse live contests in the Contest Center.",
    emoji: "📋",
    sortOrder: 7,
    xpReward: 0,
    rewards: [{ type: "badge", label: "Contest Explorer Badge", itemId: "genesis_contest_explorer" }],
  },
  {
    id: "complete_first_contest",
    title: "Complete First Contest",
    description: "Finish your first competition and earn your stripes.",
    emoji: "🥇",
    sortOrder: 8,
    xpReward: 0,
    rewards: [{ type: "badge", label: "Rookie Champion Badge", itemId: "genesis_rookie_champion" }],
    unlockAfter: ["join_first_contest"],
  },
];

export const GENESIS_MISSION_MAP = Object.fromEntries(
  GENESIS_MISSIONS.map((m) => [m.id, m])
) as Record<GenesisMissionId, GenesisMissionDefinition>;

export const GENESIS_DAILY_MOTIVATION: string[] = [
  "Every champion started exactly where you are — one contest away from momentum.",
  "Your Competitor Score grows with merit, not money. Show up and compete.",
  "Rookie Season is your launchpad — complete missions, unlock rewards, build legacy.",
  "The arena is live. Your next contest could be the one competitors remember.",
  "Follow competitors, share picks, and grow your reputation in The Huddle.",
  "Complete your profile — competitors trust faces, not placeholders.",
  "One board. One quarter. One win. That's how legends begin.",
];

export const GENESIS_LOCKED_TROPHY_PLACEHOLDERS = [
  { id: "future_champion", title: "Future Champion", emoji: "🏆", hint: "Win your first contest" },
  { id: "streak_master", title: "Streak Master", emoji: "🔥", hint: "Build a 3-win streak" },
  { id: "community_star", title: "Community Star", emoji: "⭐", hint: "Earn followers in The Huddle" },
  { id: "quarter_collector", title: "Quarter Collector", emoji: "🎯", hint: "Reach 10 lifetime wins" },
  { id: "season_veteran", title: "Season Veteran", emoji: "🛡️", hint: "Compete across 2 seasons" },
  { id: "legend_trophy", title: "Platform Legend", emoji: "👑", hint: "Unlock Legend achievements" },
];

export const GENESIS_PROFILE_UNLOCKS = [
  "favorite_sport",
  "favorite_team",
  "profile_banner",
  "avatar_frame",
  "theme_color",
  "bio",
  "location",
] as const;
