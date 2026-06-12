import type { EspnSport, ScoringPeriod } from "@/lib/types";
import { getScoringPeriods } from "@/lib/espn/sports";

export function maskPlayerName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Player";
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() ?? "";
  return `${first} ${lastInitial}.`;
}

export function formatPeriodLabel(
  period: number,
  sport: EspnSport,
  statusDetail?: string | null
): string {
  if (statusDetail?.toLowerCase().includes("halftime")) return "Halftime";
  if (sport === "ncaab") {
    if (period <= 1) return "1st Half";
    if (period === 2) return "2nd Half";
    return statusDetail ?? "Live";
  }
  if (period === 1) return "1st Quarter";
  if (period === 2) return "2nd Quarter";
  if (period === 3) return "3rd Quarter";
  if (period === 4) return "4th Quarter";
  return statusDetail ?? "Live";
}

export function formatKickoffEstimate(minutes: number | null): string {
  if (minutes === null) return "Soon";
  if (minutes <= 0) return "Live now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    return mins > 0 ? `${hours} hour${hours === 1 ? "" : "s"} ${mins}m` : `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  return "Tomorrow";
}

export function formatTimelineTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function periodDisplayLabel(period: ScoringPeriod, sport: EspnSport): string {
  if (period === "FINAL") return "Final Winner";
  if (period === "1H") return "Half 1 Winner";
  if (period === "2H") return "Halftime Winner";
  if (period === "Q1") return "Quarter 1";
  if (period === "Q2") return "Quarter 2";
  if (period === "Q3") return "Quarter 3";
  if (period === "Q4") return "Quarter 4";
  return period;
}

export function nextPayoutPeriod(
  completedPeriods: Set<ScoringPeriod>,
  sport: EspnSport
): ScoringPeriod | null {
  for (const period of getScoringPeriods(sport)) {
    if (period === "FINAL") continue;
    if (!completedPeriods.has(period)) return period;
  }
  if (!completedPeriods.has("FINAL")) return "FINAL";
  return null;
}

export function estimateMinutesToPayout(
  kickoffAt: string,
  isLive: boolean,
  periodIndex: number,
  sport: EspnSport
): number {
  if (isLive) {
    const avgPeriodMinutes = sport === "ncaab" ? 20 : 15;
    const periods = getScoringPeriods(sport).filter((p) => p !== "FINAL");
    const remaining = Math.max(periods.length - periodIndex, 1);
    return remaining * avgPeriodMinutes;
  }

  const kickoffMs = new Date(kickoffAt).getTime() - Date.now();
  const kickoffMinutes = Math.max(Math.ceil(kickoffMs / 60000), 0);
  return kickoffMinutes + (sport === "ncaab" ? 20 : 15);
}
