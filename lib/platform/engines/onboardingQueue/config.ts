/** Accounts older than this skip onboarding modals (backwards compatibility). */
export const ONBOARDING_LEGACY_SKIP_HOURS = 48;

export const ONBOARDING_QUEUE_VERSION = 1;

export const ONBOARDING_QUEUE_DEBUG =
  process.env.ONBOARDING_QUEUE_DEBUG === "true" ||
  process.env.NEXT_PUBLIC_ONBOARDING_QUEUE_DEBUG === "true";

/** Mandatory onboarding sequence — never reorder without spec update. */
export const MANDATORY_ONBOARDING_ORDER = [
  "account_created",
  "welcome",
  "mystery_pass",
  "reward_reveal",
  "founder",
  "birthday",
  "flash_event",
  "season_event",
  "profile",
  "missions",
  "competitor_score",
  "choose_journey",
  "navigate_dashboard",
] as const;

export const ONBOARDING_COPY = {
  welcomeTitle: "Your competitive journey begins…",
  welcomeMessage:
    "Welcome to SquareBoards — where every contest builds your legacy. Your exclusive welcome experience is ready.",
  mysteryTitle: "Mystery SquarePass",
  rewardRevealTitle: "Welcome Rewards Unlocked",
  founderTitle: "Founding Competitor",
  birthdayTitle: "Birthday Reward",
  birthdayMessage: "Happy birthday, competitor — an exclusive reward is waiting.",
  flashTitle: "Flash Event Live",
  seasonTitle: "Season Event",
  seasonMessage: "A limited Rookie Season event is live — claim your bonus before it ends.",
  profileTitle: "Make It Yours",
  missionsTitle: "What's Next",
  missionsMessage: "Your Rookie Season missions — complete them to climb the ranks.",
  competitorScoreTitle: "Your Competitor Score",
  chooseJourneyTitle: "Choose Your Journey",
  chooseJourneyMessage: "Pick your first arena — every path builds your legacy.",
  navigateTitle: "Welcome to the Arena",
  navigateMessage: "Your onboarding is complete. Time to compete.",
  dailyTitle: "Daily SquarePass",
  surpriseTitle: "Surprise Reward",
  continueJourney: "Continue Journey",
} as const;

/** First-arena choices — hrefs must match `PLATFORM_GAMES` playable routes. */
export const JOURNEY_OPTIONS = [
  { id: "nfl_squares", title: "NFL Squares", emoji: "🏈", href: "/games/nfl" },
  { id: "mlb_squares", title: "MLB Squares", emoji: "⚾", href: "/games/mlb" },
  { id: "pickem", title: "Pick'em Contests", emoji: "🎯", href: "/pickem" },
  { id: "marketplace", title: "Contest Marketplace", emoji: "🏟️", href: "/contest-center" },
] as const;

/** Safe post-onboarding landing — always a valid dashboard route. */
export const ONBOARDING_DASHBOARD_HREF = "/my-games" as const;
