export const FOOTBALL_PICKEM_ROYALE_PUBLIC_NAME = "Football Pick'em Royale™";

/** Supported competitions — enable via configuration as leagues launch. */
export const FOOTBALL_COMPETITIONS = [
  {
    key: "mls",
    emoji: "⚽",
    name: "MLS",
    espnPath: "soccer/usa.1",
    available: true,
  },
  {
    key: "epl",
    emoji: "🏴",
    name: "English Premier League",
    espnPath: "soccer/eng.1",
    available: false,
  },
  {
    key: "ucl",
    emoji: "⭐",
    name: "UEFA Champions League",
    espnPath: "soccer/uefa.champions",
    available: false,
  },
  {
    key: "world_cup",
    emoji: "🌍",
    name: "FIFA World Cup",
    espnPath: "soccer/fifa.world",
    available: false,
  },
  {
    key: "euro",
    emoji: "🇪🇺",
    name: "UEFA European Championship",
    espnPath: "soccer/uefa.euro",
    available: false,
  },
  {
    key: "nwsl",
    emoji: "⚽",
    name: "NWSL",
    espnPath: "soccer/usa.nwsl",
    available: false,
  },
  {
    key: "laliga",
    emoji: "🇪🇸",
    name: "La Liga",
    espnPath: "soccer/esp.1",
    available: false,
  },
  {
    key: "serie_a",
    emoji: "🇮🇹",
    name: "Serie A",
    espnPath: "soccer/ita.1",
    available: false,
  },
  {
    key: "bundesliga",
    emoji: "🇩🇪",
    name: "Bundesliga",
    espnPath: "soccer/ger.1",
    available: false,
  },
  {
    key: "ligue_1",
    emoji: "🇫🇷",
    name: "Ligue 1",
    espnPath: "soccer/fra.1",
    available: false,
  },
] as const;

export const FOOTBALL_PICKEM_TUTORIAL_STEPS = [
  {
    step: 1,
    title: "Predict the winner",
    body: "Tap the team you believe wins — or predict a draw when the match allows it.",
    emoji: "⚽",
  },
  {
    step: 2,
    title: "Lock before kickoff",
    body: "Submit your card before the first whistle. Picks lock automatically at kickoff.",
    emoji: "🔒",
  },
  {
    step: 3,
    title: "Watch live",
    body: "Cards turn green or red as matches finish. Track accuracy and streaks in real time.",
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
    title: "Never stand still",
    body: "Highlights, Derby Days™, and The Huddle keep match day alive all season long.",
    emoji: "🔥",
  },
] as const;

export const SOCCER_PICKEM_BASE_PATH = "/soccer-predictor";
