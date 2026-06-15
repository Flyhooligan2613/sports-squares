/** WNBA Pick'em Royale™ — thin branding wrapper over shared pickem core. */

export const WNBA_PICKEM_ROYALE_PUBLIC_NAME = "WNBA Pick'em Royale™";

export const WNBA_PICKEM_BASE_PATH = "/wnba-pickem";

export const WNBA_PICKEM_TUTORIAL_STEPS = [
  {
    step: 1,
    title: "Predict the winner",
    body: "Tap the team you believe wins — no spreads, no odds, just winners.",
    emoji: "🏀",
  },
  {
    step: 2,
    title: "Lock before tip-off",
    body: "Submit your card before tip-off. Picks lock automatically at game time.",
    emoji: "🔒",
  },
  {
    step: 3,
    title: "Watch live",
    body: "Cards turn green or red as games finish. Track accuracy and streaks in real time.",
    emoji: "📺",
  },
  {
    step: 4,
    title: "Earn every week",
    body: "Correct predictions build XP, tier progress, legacy, and community reputation.",
    emoji: "⭐",
  },
  {
    step: 5,
    title: "Own the court",
    body: "Highlight Squares™, Commissioner's Cup™, and The Huddle keep game day alive all season.",
    emoji: "🔥",
  },
] as const;
