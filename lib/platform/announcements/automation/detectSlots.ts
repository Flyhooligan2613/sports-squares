import type { PickemContest, PickemGame } from "@/lib/pickem/types";
import type { AnnouncementCategory } from "@/lib/platform/announcements/types";
import {
  getEasternDateParts,
  isChristmasET,
  isNewYearsET,
  isThanksgivingET,
  kickoffWeekdayEastern,
} from "@/lib/platform/announcements/automation/time";
import { getMondayNightGame } from "@/lib/pickem/mondayNight";
import { PICKEM_SEASON_TYPE_PLAYOFFS } from "@/lib/pickem/config";

export type AutomationSlotId =
  | "nfl_week_open"
  | "thursday_night"
  | "sunday_gameday"
  | "monday_tiebreaker"
  | "holiday"
  | "super_bowl"
  | "pickem_feature";

export interface AutomationSlot {
  id: AutomationSlotId;
  category: AnnouncementCategory;
  contest: PickemContest;
  weekLabel: string;
  seasonKey: string;
  startsAt: Date;
  endsAt: Date;
  meta: Record<string, string>;
}

export interface AutomationDetectionInput {
  contest: PickemContest | null;
  games: PickemGame[];
  hasActiveTiebreakers: boolean;
  now?: Date;
}

function seasonKey(contest: PickemContest): string {
  return `${contest.seasonYear}:${contest.seasonType}:${contest.weekNumber}`;
}

function firstKickoff(games: PickemGame[]): Date | null {
  if (!games.length) return null;
  return new Date(games[0].kickoffAt);
}

function thursdayGame(games: PickemGame[]): PickemGame | null {
  return games.find((g) => kickoffWeekdayEastern(g.kickoffAt) === "Thursday") ?? null;
}

function sundayGames(games: PickemGame[]): PickemGame[] {
  return games.filter((g) => kickoffWeekdayEastern(g.kickoffAt) === "Sunday");
}

export function detectAutomationSlots(
  input: AutomationDetectionInput
): AutomationSlot[] {
  const now = input.now ?? new Date();
  const et = getEasternDateParts(now);
  const slots: AutomationSlot[] = [];

  if (!input.contest) {
    return slots;
  }

  const contest = input.contest;
  const games = input.games;
  const key = seasonKey(contest);
  const firstKo = firstKickoff(games);
  const tnf = thursdayGame(games);
  const sunday = sundayGames(games);
  const monday = getMondayNightGame(games);

  // NFL week opens — contest open until first kickoff
  if (contest.status === "open" && firstKo && now < firstKo) {
    const startsAt = new Date(now.getTime() - 60_000);
    slots.push({
      id: "nfl_week_open",
      category: "nfl_week_open",
      contest,
      weekLabel: contest.label,
      seasonKey: key,
      startsAt,
      endsAt: new Date(firstKo.getTime() - 30 * 60_000),
      meta: { weekLabel: contest.label },
    });
  }

  // Thursday Night Football
  if (tnf && et.weekday === "Thursday") {
    const kickoff = new Date(tnf.kickoffAt);
    const windowStart = new Date(kickoff);
    windowStart.setHours(windowStart.getHours() - 6);
    const windowEnd = new Date(kickoff.getTime() + 4 * 3_600_000);
    if (now >= windowStart && now <= windowEnd) {
      slots.push({
        id: "thursday_night",
        category: "thursday_night",
        contest,
        weekLabel: contest.label,
        seasonKey: key,
        startsAt: windowStart,
        endsAt: windowEnd,
        meta: {
          away: tnf.awayTeam,
          home: tnf.homeTeam,
          weekLabel: contest.label,
        },
      });
    }
  }

  // Sunday Game Day
  if (sunday.length > 0 && et.weekday === "Sunday" && et.hour >= 8) {
    const lastSundayKo = new Date(
      Math.max(...sunday.map((g) => new Date(g.kickoffAt).getTime()))
    );
    const windowEnd = new Date(lastSundayKo.getTime() + 8 * 3_600_000);
    slots.push({
      id: "sunday_gameday",
      category: "sunday_gameday",
      contest,
      weekLabel: contest.label,
      seasonKey: key,
      startsAt: new Date(now.getTime() - 60_000),
      endsAt: windowEnd,
      meta: {
        gameCount: String(sunday.length),
        weekLabel: contest.label,
      },
    });
  }

  // Monday Championship Tiebreaker
  if (
    input.hasActiveTiebreakers &&
    monday &&
    monday.status !== "final" &&
    (et.weekday === "Monday" || et.weekday === "Sunday")
  ) {
    const kickoff = new Date(monday.kickoffAt);
    slots.push({
      id: "monday_tiebreaker",
      category: "monday_tiebreaker",
      contest,
      weekLabel: contest.label,
      seasonKey: key,
      startsAt: new Date(now.getTime() - 60_000),
      endsAt: kickoff,
      meta: {
        away: monday.awayTeam,
        home: monday.homeTeam,
        weekLabel: contest.label,
      },
    });
  }

  // Super Bowl week
  if (
    contest.seasonType === PICKEM_SEASON_TYPE_PLAYOFFS &&
    contest.weekNumber === 4
  ) {
    slots.push({
      id: "super_bowl",
      category: "promotion",
      contest,
      weekLabel: contest.label,
      seasonKey: key,
      startsAt: firstKo ? new Date(firstKo.getTime() - 7 * 86_400_000) : new Date(now),
      endsAt: firstKo ?? new Date(now.getTime() + 7 * 86_400_000),
      meta: { weekLabel: contest.label },
    });
  }

  // Holiday overlays (stack with week events)
  let holidayLabel: string | null = null;
  if (isThanksgivingET(et.year, et.month, et.day)) {
    holidayLabel = "Thanksgiving";
  } else if (isChristmasET(et.month, et.day)) {
    holidayLabel = "Christmas";
  } else if (isNewYearsET(et.month, et.day)) {
    holidayLabel = "New Year's Day";
  }

  if (holidayLabel) {
    const { start, end } = {
      start: new Date(now.getTime() - 60_000),
      end: new Date(now.getTime() + 20 * 3_600_000),
    };
    slots.push({
      id: "holiday",
      category: "holiday",
      contest,
      weekLabel: contest.label,
      seasonKey: `${key}:${holidayLabel.toLowerCase().replace(/\s/g, "_")}`,
      startsAt: start,
      endsAt: end,
      meta: { holiday: holidayLabel, weekLabel: contest.label },
    });
  }

  return slots;
}
