import type { DailyStoryDefinition } from "@/lib/dailyStory/types";

/** SquareBoards Daily Story™ — rotating editorial library */
export const DAILY_STORY_LIBRARY: DailyStoryDefinition[] = [
  // Holidays
  {
    id: "holiday_thanksgiving",
    emoji: "🦃",
    body: "Football. Family. Friends.\nToday is what traditions are made of.",
    tags: ["thanksgiving"],
    weight: 100,
  },
  {
    id: "holiday_christmas",
    emoji: "🎄",
    body: "May today's games bring unforgettable memories.",
    tags: ["christmas"],
    weight: 100,
  },
  {
    id: "holiday_new_year",
    emoji: "🎆",
    body: "A new year.\nA new season.\nNew opportunities.",
    tags: ["new_year"],
    weight: 100,
  },
  {
    id: "holiday_fourth",
    emoji: "🇺🇸",
    body: "Summer afternoons were made for games, good company, and great moments.",
    tags: ["fourth_july"],
    weight: 95,
  },

  // Signature events
  {
    id: "event_super_bowl",
    emoji: "🏆",
    body: "One game.\nMillions watching.\nCreate your own championship story.",
    tags: ["super_bowl"],
    weight: 98,
  },
  {
    id: "event_world_series",
    emoji: "⚾",
    body: "October legends begin with one first pitch.",
    tags: ["world_series"],
    weight: 96,
  },
  {
    id: "event_opening_day",
    emoji: "⚾",
    body: "Every season starts with hope.\nWelcome back.",
    tags: ["opening_day"],
    weight: 94,
  },
  {
    id: "event_playoffs_1",
    emoji: "🔥",
    body: "Every possession matters.\nLegacies are built today.",
    tags: ["playoffs"],
    weight: 92,
  },
  {
    id: "event_playoffs_2",
    emoji: "🔥",
    body: "Win today.\nRemember forever.",
    tags: ["playoffs"],
    weight: 92,
  },
  {
    id: "event_march_madness",
    emoji: "🏀",
    body: "One shot can echo through a lifetime.\nStay present for every moment.",
    tags: ["march_madness"],
    weight: 90,
  },

  // Player progression (warm, never salesy)
  {
    id: "prog_tier_near",
    emoji: "🏆",
    body: "Gold Tier is within reach.\nKeep building your legacy.",
    tags: ["progression_tier"],
    weight: 88,
  },
  {
    id: "prog_streak",
    emoji: "🔥",
    body: "Your winning streak is still alive.\nProtect it.",
    tags: ["progression_streak"],
    weight: 87,
  },
  {
    id: "prog_reward",
    emoji: "🎁",
    body: "A Reward Drop is waiting.\nGood things come to players who return.",
    tags: ["progression_reward"],
    weight: 86,
  },
  {
    id: "prog_survivor",
    emoji: "🛡",
    body: "Survivor Week begins today.\nTrust your instincts.",
    tags: ["progression_survivor"],
    weight: 85,
  },
  {
    id: "prog_win_today",
    emoji: "✨",
    body: "You made today count.\nCarry that momentum forward.",
    tags: ["progression_win"],
    weight: 84,
  },

  // NFL Sunday
  {
    id: "nfl_sunday_1",
    emoji: "🏈",
    body: "Every quarter tells a story.\nToday's story begins with one square.",
    tags: ["nfl_sunday"],
    weight: 80,
  },
  {
    id: "nfl_sunday_2",
    emoji: "🏈",
    body: "Every drive matters.\nEvery touchdown changes everything.\nGood luck today.",
    tags: ["nfl_sunday"],
    weight: 80,
  },
  {
    id: "nfl_sunday_3",
    emoji: "🏈",
    body: "Four quarters.\nUnlimited memories.\nLet's play.",
    tags: ["nfl_sunday"],
    weight: 80,
  },
  {
    id: "nfl_sunday_4",
    emoji: "🏈",
    body: "Sunday isn't complete until the final whistle.\nEnjoy every moment.",
    tags: ["nfl_sunday"],
    weight: 80,
  },

  // Monday / Thursday Night Football
  {
    id: "nfl_mnf",
    emoji: "🌙",
    body: "One final game.\nOne final opportunity.\nFinish the week strong.",
    tags: ["mnf"],
    weight: 78,
  },
  {
    id: "nfl_tnf",
    emoji: "🏈",
    body: "Football is back.\nYour weekend starts tonight.",
    tags: ["tnf"],
    weight: 78,
  },

  // MLB
  {
    id: "mlb_1",
    emoji: "⚾",
    body: "Every inning creates another opportunity.\nToday's first pitch begins your next chapter.",
    tags: ["mlb"],
    weight: 76,
  },
  {
    id: "mlb_2",
    emoji: "⚾",
    body: "Baseball rewards patience.\nSometimes the biggest moment comes in the ninth.\nStay ready.",
    tags: ["mlb"],
    weight: 76,
  },
  {
    id: "mlb_3",
    emoji: "⚾",
    body: "One swing can change everything.\nGood luck today.",
    tags: ["mlb"],
    weight: 76,
  },
  {
    id: "mlb_4",
    emoji: "⚾",
    body: "Nine innings of possibility.\nYour story is still being written.",
    tags: ["mlb"],
    weight: 74,
  },

  // NBA
  {
    id: "nba_1",
    emoji: "🏀",
    body: "Every possession matters.\nGreat moments are built one basket at a time.",
    tags: ["nba"],
    weight: 74,
  },
  {
    id: "nba_2",
    emoji: "🏀",
    body: "Tonight belongs to the players willing to take the shot.",
    tags: ["nba"],
    weight: 74,
  },
  {
    id: "nba_3",
    emoji: "🏀",
    body: "Forty-eight minutes.\nOne unforgettable run can define the night.",
    tags: ["nba"],
    weight: 72,
  },

  // NHL
  {
    id: "nhl_1",
    emoji: "🏒",
    body: "Sixty minutes.\nCountless unforgettable moments.\nLet's play.",
    tags: ["nhl"],
    weight: 72,
  },
  {
    id: "nhl_2",
    emoji: "🏒",
    body: "Every shift writes a line in tonight's story.",
    tags: ["nhl"],
    weight: 70,
  },

  // Soccer
  {
    id: "soccer_1",
    emoji: "⚽",
    body: "Ninety minutes.\nOne perfect moment can change everything.",
    tags: ["soccer"],
    weight: 70,
  },
  {
    id: "soccer_2",
    emoji: "⚽",
    body: "The beautiful game rewards belief until the final whistle.",
    tags: ["soccer"],
    weight: 68,
  },

  // Time of day
  {
    id: "phase_morning",
    emoji: "🌅",
    body: "A fresh slate.\nToday's games are waiting to become memories.",
    tags: ["morning"],
    weight: 40,
  },
  {
    id: "phase_afternoon",
    emoji: "☀️",
    body: "The day is building.\nStay close — the best moments arrive without warning.",
    tags: ["afternoon"],
    weight: 40,
  },
  {
    id: "phase_evening",
    emoji: "🌆",
    body: "Prime time is here.\nThis is when legends introduce themselves.",
    tags: ["evening"],
    weight: 42,
  },
  {
    id: "phase_night",
    emoji: "🌙",
    body: "The final chapters of game day are being written.\nSavor every one.",
    tags: ["night"],
    weight: 42,
  },

  // General / evergreen
  {
    id: "general_1",
    emoji: "📖",
    body: "Every fan has a chance.\nToday is yours to write.",
    tags: ["general"],
    weight: 20,
  },
  {
    id: "general_2",
    emoji: "✨",
    body: "Great sports days are not watched.\nThey are lived.",
    tags: ["general"],
    weight: 20,
  },
  {
    id: "general_3",
    emoji: "🏟",
    body: "Somewhere today, an ordinary moment becomes unforgettable.\nMaybe it's yours.",
    tags: ["general"],
    weight: 18,
  },
  {
    id: "general_4",
    emoji: "💫",
    body: "You belong here.\nEvery game day starts with a story worth telling.",
    tags: ["general"],
    weight: 18,
  },
  {
    id: "general_5",
    emoji: "🎯",
    body: "Anticipation is part of the magic.\nToday has something good in store.",
    tags: ["general"],
    weight: 16,
  },
  {
    id: "general_6",
    emoji: "🌟",
    body: "SquareBoards is where sports stories begin.\nWelcome to today's chapter.",
    tags: ["general"],
    weight: 16,
  },
];
