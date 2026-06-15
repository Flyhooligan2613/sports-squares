import type { GameDayAtmosphere, GameDayPhase } from "@/lib/gameDay/types";

export type FavoriteSport = "nfl" | "mlb" | "nba" | "ncaaf" | "ncaab";

const SPORT_EMOJI: Record<FavoriteSport, string> = {
  nfl: "🏈",
  mlb: "⚾",
  nba: "🏀",
  ncaaf: "🏈",
  ncaab: "🏀",
};

export interface GreetingContext {
  phase: GameDayPhase;
  firstName: string;
  atmosphere: GameDayAtmosphere;
  isGameDay: boolean;
  favoriteSport?: FavoriteSport | null;
  now?: Date;
}

function resolveHolidayGreeting(now: Date): string | null {
  const month = now.getMonth();
  const date = now.getDate();

  if (month === 11 && date >= 24 && date <= 26) {
    return "🎄 Happy Holidays";
  }
  if (month === 10 && date >= 22 && date <= 28) {
    return "🦃 Happy Thanksgiving";
  }
  if (month === 6 && date === 4) {
    return "🇺🇸 Happy Fourth of July";
  }
  if (month === 0 && date === 1) {
    return "🎆 Happy New Year";
  }
  if (month === 1 && date === 14) {
    return "💫 Welcome Back";
  }

  return null;
}

export function buildWelcomeGreeting(ctx: GreetingContext): string {
  const now = ctx.now ?? new Date();
  const sportEmoji = ctx.favoriteSport ? SPORT_EMOJI[ctx.favoriteSport] : ctx.atmosphere.emoji;
  const holiday = resolveHolidayGreeting(now);

  if (holiday) {
    return ctx.firstName ? `${holiday}, ${ctx.firstName}.` : `${holiday}.`;
  }

  if (ctx.isGameDay && (ctx.phase === "afternoon" || ctx.phase === "evening")) {
    return `${sportEmoji} Ready For Game Day${ctx.firstName ? `, ${ctx.firstName}` : ""}?`;
  }

  switch (ctx.phase) {
    case "morning":
      return ctx.firstName
        ? `${sportEmoji} Good Morning, ${ctx.firstName}.`
        : `${sportEmoji} Good Morning.`;
    case "afternoon":
      return ctx.firstName
        ? `${sportEmoji} Good Afternoon, ${ctx.firstName}.`
        : `${sportEmoji} Good Afternoon.`;
    case "evening":
      return ctx.firstName
        ? `${sportEmoji} Welcome Back, ${ctx.firstName}.`
        : `${sportEmoji} Welcome Back.`;
    case "night":
      return ctx.firstName
        ? `${sportEmoji} Great Game Day, ${ctx.firstName}.`
        : `${sportEmoji} Great Game Day.`;
  }
}

export function buildGreetingSubtitle(ctx: GreetingContext): string {
  const now = ctx.now ?? new Date();
  const holiday = resolveHolidayGreeting(now);

  if (holiday) {
    return `${ctx.atmosphere.tagline} — enjoy the moment with your SquareBoards family.`;
  }

  if (ctx.isGameDay) {
    return ctx.atmosphere.tagline;
  }

  return "Your personal sports lounge — everything happening today, in one place.";
}
