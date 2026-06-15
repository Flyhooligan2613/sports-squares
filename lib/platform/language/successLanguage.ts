/**
 * Success and confirmation messages — celebrate achievement, not transactions.
 * Platform Polish Sprint #002 — Contest Language Engine™
 */

export const SUCCESS_MESSAGES = {
  contestJoined: "You're in the contest — good luck!",
  contestLocked: "Your contest entry is locked in.",
  picksSubmitted: "Picks locked in — competition awaits.",
  achievementClaimed: "Achievement claimed — added to your legacy.",
  rewardClaimed: "Competition reward claimed.",
  referralSent: "Invite sent — grow the community.",
  profileUpdated: "Competitor Profile updated.",
  settingsSaved: "Settings saved.",
  purchaseComplete: "Squares secured — you're in the contest.",
  tierPromoted: "Tier promotion unlocked — your reputation is rising.",
  championCrowned: "Champion crowned — your legacy is permanent.",
} as const;

export type SuccessMessageKey = keyof typeof SUCCESS_MESSAGES;
