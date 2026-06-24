import type { PolicyDocument } from "../types";

export const officialContestRules: PolicyDocument = {
  sections: [
    {
      heading: "1. Authority",
      subsections: [
        {
          paragraphs: [
            "These Official Contest Rules govern all SquareBoards contests unless a specific contest page publishes supplemental rules. In case of conflict, the contest-specific disclosure at entry controls for that contest.",
          ],
        },
      ],
    },
    {
      heading: "2. Contest Formats",
      subsections: [
        {
          heading: "Squares",
          bullets: [
            "Competitors purchase squares on a grid tied to an official sporting event.",
            "Digits are assigned randomly after the board locks or at the published assignment time.",
            "Winning squares are determined by the last digit of each team's score at designated checkpoints (e.g., quarters, innings, final).",
          ],
        },
        {
          heading: "Pick'em and skill formats",
          bullets: [
            "Competitors select outcomes before published lock times.",
            "Picks lock automatically at kickoff or the stated deadline.",
            "Standings and winners are calculated from official league results.",
          ],
        },
        {
          heading: "Survivor, brackets, and other modes",
          bullets: [
            "Each mode publishes entry tiers, elimination rules, and payout structure before join.",
            "Future game modes inherit platform entry tiers and hosting fee schedules unless otherwise noted.",
          ],
        },
      ],
    },
    {
      heading: "3. Entry and Lock Times",
      subsections: [
        {
          bullets: [
            "Entry fees and prize pool percentages are shown before confirmation.",
            "A contest is binding once payment succeeds and the entry is recorded in SquareBank™.",
            "Late entries are not accepted after the published lock time.",
            "SquareBoards may guarantee contests that reach capacity thresholds (e.g., 85% for squares).",
          ],
        },
      ],
    },
    {
      heading: "4. Scoring and Data Sources",
      subsections: [
        {
          paragraphs: [
            "Scores and results come from official league data feeds (including ESPN and partner providers). SquareBoards does not manually edit scores to change outcomes.",
          ],
          bullets: [
            "Corrections from official sources may update results retroactively.",
            "Delays, overtime, and sport-specific rules follow league standards unless stated on the contest page.",
          ],
        },
      ],
    },
    {
      heading: "5. Winners and Payouts",
      subsections: [
        {
          bullets: [
            "Winners are determined by published formulas after final official results.",
            "Payouts are queued automatically through SquareWallet™ and Stripe Connect.",
            "Winners must complete payout setup and any required identity verification.",
            "Ties are resolved by the tie-break method disclosed for that contest format.",
          ],
        },
      ],
    },
    {
      heading: "6. Platform-Hosted Model",
      subsections: [
        {
          paragraphs: [
            "SquareBoards is fully automated. There are no pool commissioners or hosts who control payouts. Administrators cannot alter winners, scores, or manual payout amounts.",
          ],
        },
      ],
    },
    {
      heading: "7. Disputes and Corrections",
      subsections: [
        {
          numbered: [
            "Review the contest timeline and official result in your competition history.",
            "Submit a support request within seven (7) days of contest completion with contest ID and details.",
            "SquareBoards investigates using audit logs, SquareBank™ entries, and feed data.",
            "Decisions based on official data and these rules are final except where law requires otherwise.",
          ],
        },
      ],
    },
    {
      heading: "8. Void Contests",
      subsections: [
        {
          paragraphs: [
            "Contests may be voided for official game cancellations, feed failures that prevent fair resolution, or security incidents. Voided contests follow the Refund Policy.",
          ],
        },
      ],
    },
  ],
};
