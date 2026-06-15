import type { GameDayPhase } from "@/lib/gameDay/types";

const PHASE_LABELS: Record<GameDayPhase, string> = {
  morning: "Good Morning",
  afternoon: "Game Day Afternoon",
  evening: "Game Day Evening",
  night: "Game Day Recap",
};

export function resolveGameDayPhase(now = new Date()): GameDayPhase {
  const hour = now.getHours();
  if (hour >= 22 || hour < 6) return "night";
  if (hour >= 18) return "evening";
  if (hour >= 12) return "afternoon";
  return "morning";
}

export function phaseLabel(phase: GameDayPhase, displayName: string): string {
  const timeGreeting = PHASE_LABELS[phase];
  if (phase === "morning") return `${timeGreeting}, ${displayName}`;
  if (phase === "night") return `Great Game Day, ${displayName}`;
  return `${displayName} — ${timeGreeting}`;
}

export function isGameDaySurface(now = new Date()): boolean {
  const day = now.getDay();
  const hour = now.getHours();
  if (day === 0 || day === 6) return true;
  if (hour >= 12 && hour < 23) return true;
  return false;
}
