/** First N competitors receive founding competitor recognition. */
export const FOUNDING_COMPETITOR_LIMIT = Number(
  process.env.FOUNDING_COMPETITOR_LIMIT ?? "10000"
);

/** Accounts older than this skip onboarding modals (backwards compatibility). */
export const AUTOMATION_LEGACY_SKIP_HOURS = 48;

export const AUTOMATION_COPY = {
  welcomeTitle: "Your competitive journey begins…",
  welcomeMessage:
    "Welcome to SquareBoards — where every contest builds your legacy. Your exclusive welcome experience is ready.",
  mysteryTitle: "Mystery SquarePass",
  mysteryMessage: "Every competitor receives a guaranteed reward. Tap to reveal yours.",
  rewardRevealTitle: "Welcome Rewards Unlocked",
  rewardRevealMessage: "Your exclusive welcome opportunities are live on your Competitor Card.",
  founderTitle: "Founding Competitor",
  founderMessage:
    "You are among the first competitors on SquareBoards. This moment belongs in your legacy.",
  whatsNextTitle: "What's Next",
  whatsNextMessage: "Your Rookie Season missions — complete them to climb the ranks.",
  profileTitle: "Make It Yours",
  profileMessage: "Customize your Competitor Card before you enter the arena.",
  dailyTitle: "Daily SquarePass",
  dailyMessage: "Your daily exclusive opportunity is ready — tap to reveal.",
  flashTitle: "Flash Event Live",
  flashMessage: "Limited-time opportunity — don't miss your window.",
  surpriseTitle: "Surprise Reward",
  surpriseMessage: "Something special just unlocked for you.",
  continueJourney: "Continue Journey",
} as const;

export const MYSTERY_CAMPAIGN_SLUG = "mystery-square-pass";
export const FOUNDER_CAMPAIGN_SLUG = "founding-competitor";
export const DAILY_CAMPAIGN_SLUG = "daily-square-pass";
export const FLASH_CAMPAIGN_SLUG = "flash-double-xp";

/** Fallback when DB pool is empty — never return no reward. */
export const MYSTERY_FALLBACK_REWARD = {
  type: "xp" as const,
  amount: 250,
  label: "250 XP",
};
