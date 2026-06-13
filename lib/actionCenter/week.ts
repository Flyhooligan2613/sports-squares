/** Sunday 00:00 UTC → next Sunday 00:00 UTC (covers NFL Thu–Mon slates). */
export function getCurrentSportsWeekRange(now = new Date()): { start: Date; end: Date } {
  const start = new Date(now);
  const day = start.getUTCDay();
  start.setUTCDate(start.getUTCDate() - day);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);

  return { start, end };
}

export function isKickoffInCurrentWeek(kickoffAt: string, now = new Date()): boolean {
  const { start, end } = getCurrentSportsWeekRange(now);
  const t = new Date(kickoffAt).getTime();
  return t >= start.getTime() && t < end.getTime();
}
