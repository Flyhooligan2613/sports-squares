/** Reusable trust messaging across the platform. */

export const TRUST_MESSAGES = {
  officialScores:
    "Scores provided by official league data feeds.",
  stripePayouts:
    "Payouts processed automatically through Stripe.",
  adminNeutral:
    "Administrators cannot alter game results.",
  fullyAutomated: "SquareBoards is fully automated.",
  guaranteedPlay:
    "Guaranteed games once boards reach 85% capacity.",
  growthFund:
    "Platform-owned entries fund community promotions — never admin payouts.",
  pickemLock: "Picks lock automatically at kickoff.",
  noCommissioners: "No commissioners. No hosts. Just play.",
} as const;

export type TrustMessageKey = keyof typeof TRUST_MESSAGES;

export const TRUST_MESSAGE_LIST = Object.values(TRUST_MESSAGES);
