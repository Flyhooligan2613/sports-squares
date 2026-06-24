import type { PolicyDocument } from "../types";

export const communityGuidelinesPolicy: PolicyDocument = {
  sections: [
    {
      heading: "1. Building a Premium Community",
      subsections: [
        {
          paragraphs: [
            "SquareBoards competes on skill, reputation, and legacy — not toxicity. These guidelines apply to usernames, profiles, messages, support interactions, and any community-facing features.",
          ],
        },
      ],
    },
    {
      heading: "2. Expected Conduct",
      subsections: [
        {
          bullets: [
            "Treat competitors, staff, and partners with respect.",
            "Celebrate wins and accept losses without harassment.",
            "Give honest feedback through official support channels.",
            "Report bugs and policy violations instead of public witch hunts.",
          ],
        },
      ],
    },
    {
      heading: "3. Prohibited Behavior",
      subsections: [
        {
          bullets: [
            "Hate speech, slurs, or attacks based on protected characteristics.",
            "Threats, doxxing, stalking, or encouragement of violence.",
            "Sexual content, exploitation, or unwanted advances.",
            "Spam, scams, phishing, or unauthorized advertising.",
            "Impersonation of SquareBoards staff or other competitors.",
            "Cheating, collusion, or sharing exploits publicly.",
          ],
        },
      ],
    },
    {
      heading: "4. Profiles and Usernames",
      subsections: [
        {
          paragraphs: [
            "Usernames and avatars must not be offensive, misleading, or infringe trademarks. We may require changes or assign temporary placeholders for violations.",
          ],
        },
      ],
    },
    {
      heading: "5. Enforcement",
      subsections: [
        {
          bullets: [
            "Warning and required profile changes for minor issues.",
            "Temporary mute or feature restrictions.",
            "Contest forfeiture where conduct affected fair play.",
            "Suspension or permanent ban for serious or repeat violations.",
          ],
          paragraphs: [
            "Enforcement decisions are made by SquareBoards at its discretion to protect the community. See Fair Play Policy for competition-specific violations.",
          ],
        },
      ],
    },
    {
      heading: "6. Reporting",
      subsections: [
        {
          paragraphs: [
            "Use Support → Report a Problem or support@squareboards.pro. Include screenshots, usernames, and contest context. Retaliation against reporters is prohibited.",
          ],
        },
      ],
    },
  ],
};
