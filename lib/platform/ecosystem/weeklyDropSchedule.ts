/** Rolling Square Drop cadence — 6 days after first play, then every 6 days after each open. */

export const WEEKLY_DROP_INTERVAL_DAYS = 6;
export const WEEKLY_DROP_INTERVAL_MS =
  WEEKLY_DROP_INTERVAL_DAYS * 24 * 60 * 60 * 1000;

export function addDropInterval(from: Date): Date {
  return new Date(from.getTime() + WEEKLY_DROP_INTERVAL_MS);
}

export function computeInitialNextDropAt(firstPlayAt: Date): Date {
  return addDropInterval(firstPlayAt);
}

export function computeNextDropAfterOpen(openedAt: Date): Date {
  return addDropInterval(openedAt);
}

export function msUntilDrop(nextDropAt: Date | null, now = new Date()): number {
  if (!nextDropAt) return 0;
  return Math.max(0, nextDropAt.getTime() - now.getTime());
}

export function isDropDue(nextDropAt: Date | null, now = new Date()): boolean {
  if (!nextDropAt) return false;
  return now.getTime() >= nextDropAt.getTime();
}

export function formatDropCountdown(ms: number): string {
  if (ms <= 0) return "Available now";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function dropCycleKey(at = new Date()): string {
  return `cycle-${at.toISOString()}`;
}
