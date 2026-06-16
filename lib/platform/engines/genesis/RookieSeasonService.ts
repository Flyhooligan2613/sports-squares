import { ROOKIE_SEASON_DAYS } from "@/lib/platform/engines/genesis/config";
import type { RookieSeasonState } from "@/lib/platform/engines/genesis/types";

export function buildRookieSeasonState(
  startedAt: string | null,
  endsAt: string | null
): RookieSeasonState {
  if (!startedAt) {
    return { active: false, startedAt: null, endsAt: null, daysRemaining: null };
  }

  const end = endsAt ? new Date(endsAt) : new Date(new Date(startedAt).getTime() + ROOKIE_SEASON_DAYS * 86400000);
  const now = Date.now();
  const active = now <= end.getTime();
  const daysRemaining = active
    ? Math.max(0, Math.ceil((end.getTime() - now) / 86400000))
    : 0;

  return {
    active,
    startedAt,
    endsAt: end.toISOString(),
    daysRemaining: active ? daysRemaining : null,
  };
}

export function computeRookieSeasonEnd(startedAt: Date): string {
  const end = new Date(startedAt);
  end.setUTCDate(end.getUTCDate() + ROOKIE_SEASON_DAYS);
  return end.toISOString();
}
