import type { PolicyDocument } from "../types";

export const fairPlayPolicy: PolicyDocument = {
  sections: [
    {
      heading: "1. Purpose",
      subsections: [
        {
          paragraphs: [
            "Fair play is the foundation of SquareBoards. Every competitor deserves equal treatment under published rules, automated scoring, and transparent settlement through SquareBank™.",
          ],
        },
      ],
    },
    {
      heading: "2. Automated Integrity",
      subsections: [
        {
          bullets: [
            "Contest locks, scoring, and payouts run through audited automation — not discretionary admin action.",
            "Official league feeds are the source of truth for results.",
            "Hosting fees and entry tiers are fixed in platform configuration.",
            "Administrators cannot edit scores, change winners, or issue manual payouts.",
          ],
        },
      ],
    },
    {
      heading: "3. Prohibited Conduct",
      subsections: [
        {
          bullets: [
            "Multi-accounting, collusion, or coordinated manipulation of contests.",
            "Use of bots, scripts, or exploits to submit picks or purchases.",
            "Sharing accounts or selling access to winning positions.",
            "Submitting false identity or payment information.",
            "Harassment, hate speech, or threats toward competitors or staff.",
          ],
        },
      ],
    },
    {
      heading: "4. Investigation and Enforcement",
      subsections: [
        {
          numbered: [
            "Reports and automated risk signals trigger review by our trust and safety team.",
            "We may request identity verification or additional documentation.",
            "Confirmed violations may result in warnings, contest voids, forfeiture, suspension, or permanent ban.",
            "Serious fraud may be referred to payment partners and law enforcement.",
          ],
        },
      ],
    },
    {
      heading: "5. Appeals",
      subsections: [
        {
          paragraphs: [
            "If your account receives an enforcement action, reply to the notice or email compliance@squareboards.pro within fourteen (14) days with supporting information. We aim to complete appeals within a reasonable timeframe.",
          ],
        },
      ],
    },
    {
      heading: "6. Transparency",
      subsections: [
        {
          paragraphs: [
            "Platform economics, automation guarantees, and administrator restrictions are published in our Transparency Center. Fair play depends on competitors understanding how contests work — not on hidden rules.",
          ],
        },
      ],
    },
  ],
};
