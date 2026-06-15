import type { GameDayAtmosphere, GameDayAtmosphereTheme } from "@/lib/gameDay/types";

const THEMES: Record<GameDayAtmosphereTheme, Omit<GameDayAtmosphere, "theme">> = {
  default: {
    label: "Game Day",
    emoji: "🏈",
    tagline: "Something exciting is happening on SquareBoards.",
  },
  nfl_sunday: {
    label: "NFL Sunday",
    emoji: "🏈",
    tagline: "The biggest board day of the week — every fan has a chance.",
  },
  playoffs: {
    label: "Playoff Energy",
    emoji: "🔥",
    tagline: "Stakes are higher. Moments hit harder. Stay in the game.",
  },
  super_bowl: {
    label: "Super Bowl Sunday",
    emoji: "🏆",
    tagline: "The ultimate game day. Make it legendary.",
  },
  opening_day: {
    label: "Opening Day",
    emoji: "⚾",
    tagline: "A fresh season of squares, highlights, and momentum.",
  },
  world_series: {
    label: "World Series",
    emoji: "⚾",
    tagline: "October baseball at its finest — every inning matters.",
  },
  march_madness: {
    label: "March Madness",
    emoji: "🏀",
    tagline: "Bracket chaos meets board excitement.",
  },
  championship: {
    label: "Championship Weekend",
    emoji: "👑",
    tagline: "Crown-worthy moments are loading across the platform.",
  },
};

function isNflSunday(now: Date): boolean {
  return now.getDay() === 0;
}

function isSuperBowlWindow(now: Date): boolean {
  return now.getMonth() === 1 && now.getDate() >= 1 && now.getDate() <= 15;
}

function isOpeningDayWindow(now: Date): boolean {
  return now.getMonth() === 2 && now.getDate() >= 20 && now.getDate() <= 31;
}

function isWorldSeriesWindow(now: Date): boolean {
  return now.getMonth() === 9 && now.getDate() >= 15;
}

function isMarchMadnessWindow(now: Date): boolean {
  return now.getMonth() === 2 || (now.getMonth() === 3 && now.getDate() <= 10);
}

export function resolveGameDayAtmosphere(now = new Date()): GameDayAtmosphere {
  let theme: GameDayAtmosphereTheme = "default";

  if (isSuperBowlWindow(now)) {
    theme = "super_bowl";
  } else if (isNflSunday(now)) {
    theme = "nfl_sunday";
  } else if (isOpeningDayWindow(now)) {
    theme = "opening_day";
  } else if (isWorldSeriesWindow(now)) {
    theme = "world_series";
  } else if (isMarchMadnessWindow(now)) {
    theme = "march_madness";
  } else if (now.getDay() === 6 || now.getDay() === 0) {
    theme = "championship";
  }

  return { theme, ...THEMES[theme] };
}
