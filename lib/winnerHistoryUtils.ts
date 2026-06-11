import type { Participant, ScoringPeriod, WinnerHistory, WinnerResult } from "./types";

export function enrichWinnerHistory(
  history: WinnerHistory,
  participants: Participant[]
): WinnerHistory {
  const byName = new Map(
    participants.map((p) => [p.name.toLowerCase(), p])
  );

  const enriched: WinnerHistory = {};
  for (const [period, winner] of Object.entries(history)) {
    if (!winner) continue;
    const match = byName.get(winner.ownerName.toLowerCase());
    enriched[period as ScoringPeriod] = {
      ...winner,
      ownerInitials: winner.ownerInitials ?? match?.initials,
      ownerColor: winner.ownerColor ?? match?.color,
    };
  }
  return enriched;
}

export function getNewestWinnerPeriod(
  history: WinnerHistory,
  scoringPeriods: ScoringPeriod[]
): ScoringPeriod | null {
  let newest: { period: ScoringPeriod; time: number } | null = null;

  for (const period of scoringPeriods) {
    const winner = history[period];
    if (!winner) continue;
    const time = winner.recordedAt
      ? new Date(winner.recordedAt).getTime()
      : scoringPeriods.indexOf(period);
    if (!newest || time >= newest.time) {
      newest = { period, time };
    }
  }

  return newest?.period ?? null;
}

export function hasPayoutData(history: WinnerHistory): boolean {
  return Object.values(history).some(
    (w) => w && w.payoutAmount != null && w.payoutAmount > 0
  );
}

export function formatWinnerScore(
  awayTeam: string,
  homeTeam: string,
  awayScore: number,
  homeScore: number
): string {
  return `${awayScore}-${homeScore}`;
}

export function formatRecordedAt(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export function withRecordedAt(result: WinnerResult): WinnerResult {
  return {
    ...result,
    recordedAt: result.recordedAt ?? new Date().toISOString(),
  };
}
