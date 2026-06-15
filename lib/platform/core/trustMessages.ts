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
  fixedHostingFees:
    "Entry prices and hosting fees are fixed — administrators cannot change them.",
  competitionNotWagering:
    "Pick'em is a skill competition among players worldwide — not wagering against the platform.",
  squaresLottery:
    "Squares is lottery-style among participants — random digits, official scores, automated payouts.",
  connectRequired:
    "Stripe Connect cash-out accounts are required so winners receive automated payouts directly.",
  cashOutDebitTip:
    "Major debit cards recommended for the fastest cash-outs. SquareBoards is built for massive payouts — winnings deposit straight to your Stripe cash-out account.",
} as const;

export type TrustMessageKey = keyof typeof TRUST_MESSAGES;

export const TRUST_MESSAGE_LIST = Object.values(TRUST_MESSAGES);
