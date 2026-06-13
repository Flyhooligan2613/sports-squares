/** Approximate MLB opening days — used for weekly slate numbering. */
const MLB_SEASON_OPENER: Record<number, string> = {
  2024: "2024-03-28",
  2025: "2025-03-27",
  2026: "2026-03-26",
};

function parseUtcDate(isoDate: string): Date {
  return new Date(`${isoDate}T17:00:00.000Z`);
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function formatEspnDateParam(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function getMlbSeasonOpener(seasonYear: number): Date {
  const iso = MLB_SEASON_OPENER[seasonYear] ?? `${seasonYear}-03-27`;
  return parseUtcDate(iso);
}

export function getMlbWeekDateRange(
  seasonYear: number,
  weekNumber: number
): { weekStart: Date; weekEnd: Date } {
  const opener = getMlbSeasonOpener(seasonYear);
  const weekStart = addUtcDays(opener, (weekNumber - 1) * 7);
  const weekEnd = addUtcDays(weekStart, 6);
  return { weekStart, weekEnd };
}

export function getCurrentMlbWeekNumber(
  seasonYear: number,
  now: Date = new Date()
): number {
  const opener = getMlbSeasonOpener(seasonYear);
  const diffMs = now.getTime() - opener.getTime();
  if (diffMs < 0) return 1;
  const week = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, week);
}
