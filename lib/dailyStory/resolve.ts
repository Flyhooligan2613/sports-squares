import { DAILY_STORY_LIBRARY } from "@/lib/dailyStory/library";
import type {
  DailyStory,
  DailyStoryContext,
  DailyStoryDefinition,
  DailyStoryTheme,
} from "@/lib/dailyStory/types";
import { normalizeEmail } from "@/lib/player/statsCore";

function dailySeed(email: string, date: Date): number {
  const key = `${normalizeEmail(email)}:${date.toISOString().slice(0, 10)}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function isThanksgiving(now: Date): boolean {
  return now.getMonth() === 10 && now.getDate() >= 22 && now.getDate() <= 28;
}

function isChristmas(now: Date): boolean {
  return now.getMonth() === 11 && now.getDate() >= 24 && now.getDate() <= 26;
}

function isNewYear(now: Date): boolean {
  return now.getMonth() === 0 && now.getDate() <= 2;
}

function isFourthOfJuly(now: Date): boolean {
  return now.getMonth() === 6 && now.getDate() === 4;
}

function buildActiveTags(ctx: DailyStoryContext): Set<string> {
  const tags = new Set<string>();
  const day = ctx.now.getDay();

  tags.add(ctx.phase);
  tags.add("general");

  if (isThanksgiving(ctx.now)) tags.add("thanksgiving");
  if (isChristmas(ctx.now)) tags.add("christmas");
  if (isNewYear(ctx.now)) tags.add("new_year");
  if (isFourthOfJuly(ctx.now)) tags.add("fourth_july");

  switch (ctx.atmosphereTheme) {
    case "super_bowl":
      tags.add("super_bowl");
      break;
    case "world_series":
      tags.add("world_series");
      break;
    case "opening_day":
      tags.add("opening_day");
      break;
    case "playoffs":
    case "championship":
      tags.add("playoffs");
      break;
    case "march_madness":
      tags.add("march_madness");
      tags.add("nba");
      break;
    case "nfl_sunday":
      tags.add("nfl_sunday");
      tags.add("nfl");
      break;
    case "holiday":
      tags.add("christmas");
      break;
    default:
      break;
  }

  if (day === 0) tags.add("nfl_sunday");
  if (day === 1 && (ctx.phase === "evening" || ctx.phase === "night")) tags.add("mnf");
  if (day === 4) tags.add("tnf");

  const sport = ctx.favoriteSport ?? inferSportFromTheme(ctx.atmosphereTheme);
  if (sport === "mlb") tags.add("mlb");
  if (sport === "nfl") tags.add("nfl");
  if (sport === "nba") tags.add("nba");

  if (ctx.creditsToNextTier > 0 && ctx.creditsToNextTier <= 75 && ctx.nextTierLabel) {
    tags.add("progression_tier");
  }
  if (ctx.currentWinStreak >= 2) tags.add("progression_streak");
  if (ctx.weeklyDropAvailable) tags.add("progression_reward");
  if (ctx.survivorPickWaiting) tags.add("progression_survivor");
  if (ctx.winsToday > 0) tags.add("progression_win");

  return tags;
}

function inferSportFromTheme(
  theme: DailyStoryContext["atmosphereTheme"]
): "nfl" | "mlb" | "nba" | null {
  if (theme === "opening_day" || theme === "world_series") return "mlb";
  if (theme === "march_madness") return "nba";
  if (theme === "nfl_sunday" || theme === "super_bowl") return "nfl";
  return null;
}

function scoreStory(story: DailyStoryDefinition, activeTags: Set<string>): number {
  let score = 0;
  for (const tag of story.tags) {
    if (activeTags.has(tag)) score += story.weight;
  }
  return score;
}

function resolveTheme(story: DailyStoryDefinition, ctx: DailyStoryContext): DailyStoryTheme {
  if (story.tags.some((t) => t.startsWith("progression"))) return "progression";
  if (story.tags.includes("super_bowl")) return "super_bowl";
  if (story.tags.includes("world_series")) return "world_series";
  if (story.tags.includes("opening_day")) return "opening_day";
  if (story.tags.includes("playoffs")) return "playoffs";
  if (story.tags.includes("march_madness")) return "march_madness";
  if (story.tags.includes("mlb")) return "mlb";
  if (story.tags.includes("nba")) return "nba";
  if (story.tags.includes("nhl")) return "nhl";
  if (story.tags.includes("soccer")) return "soccer";
  if (story.tags.includes("nfl_sunday") || story.tags.includes("mnf") || story.tags.includes("tnf")) {
    return "nfl";
  }
  if (ctx.atmosphereTheme === "holiday") return "holiday";
  return ctx.atmosphereTheme;
}

function personalizeBody(body: string, ctx: DailyStoryContext, storyId: string): string {
  if (storyId === "prog_tier_near" && ctx.nextTierLabel) {
    return `${ctx.nextTierLabel} is within reach.\nKeep building your legacy.`;
  }
  return body;
}

export function resolveDailyStory(ctx: DailyStoryContext): DailyStory {
  const activeTags = buildActiveTags(ctx);

  const scored = DAILY_STORY_LIBRARY.map((story) => ({
    story,
    score: scoreStory(story, activeTags),
  })).filter((entry) => entry.score > 0);

  scored.sort((a, b) => b.score - a.score);

  const topScore = scored[0]?.score ?? 0;
  const pool = scored.filter((entry) => entry.score >= topScore - 8).map((entry) => entry.story);

  const seed = dailySeed(ctx.email, ctx.now);
  const picked = pool[seed % pool.length] ?? DAILY_STORY_LIBRARY.find((s) => s.tags.includes("general"))!;

  return {
    id: picked.id,
    emoji: picked.emoji,
    body: personalizeBody(picked.body, ctx, picked.id),
    theme: resolveTheme(picked, ctx),
  };
}
