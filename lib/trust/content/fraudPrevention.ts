import type { PolicyDocument } from "../types";

export const fraudPreventionPolicy: PolicyDocument = {
  sections: [
    {
      heading: "1. Overview",
      subsections: [
        {
          paragraphs: [
            "SquareBoards invests in fraud prevention to protect legitimate competitors, prize pools, and payment partners. This policy describes our approach — not the specific methods we use, which we do not disclose to avoid circumvention.",
          ],
        },
      ],
    },
    {
      heading: "2. Threats We Address",
      subsections: [
        {
          bullets: [
            "Stolen payment instruments and card testing.",
            "Multi-accounting and bonus or referral abuse.",
            "Collusion and coordinated contest manipulation.",
            "Account takeover and credential stuffing.",
            "Chargeback fraud and friendly fraud.",
            "Synthetic or fraudulent identity submissions.",
          ],
        },
      ],
    },
    {
      heading: "3. Prevention Controls",
      subsections: [
        {
          bullets: [
            "Stripe Radar and payment risk scoring on transactions.",
            "Device fingerprinting, velocity limits, and behavioral signals.",
            "Mandatory SquareWallet™ payout setup for winnings.",
            "Identity verification for payouts and elevated risk events.",
            "SquareBank™ ledger reconciliation for every balance mutation.",
            "Automated holds on suspicious entries before contest lock when appropriate.",
          ],
        },
      ],
    },
    {
      heading: "4. Investigation Process",
      subsections: [
        {
          numbered: [
            "Risk systems or user reports generate a case.",
            "Analysts review contest history, payment data, and account linkages.",
            "Affected parties may be asked for documentation.",
            "Findings are documented with actions taken and appeal rights where applicable.",
          ],
        },
      ],
    },
    {
      heading: "5. Actions We May Take",
      subsections: [
        {
          bullets: [
            "Decline or reverse transactions before contest participation.",
            "Void entries and refund legitimate competitors when a contest is compromised.",
            "Freeze SquareWallet™ balances pending investigation.",
            "Suspend or terminate accounts and ban linked identifiers.",
            "Cooperate with Stripe, banks, and law enforcement.",
          ],
        },
      ],
    },
    {
      heading: "6. Reporting Fraud",
      subsections: [
        {
          paragraphs: [
            "If you suspect fraud, contact support@squareboards.pro immediately with contest IDs, usernames, and transaction details. Do not confront suspected abusers publicly — let our team investigate.",
          ],
        },
      ],
    },
  ],
};
