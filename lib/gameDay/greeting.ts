import type { GameDayPhase } from "@/lib/gameDay/types";

export function buildWelcomeGreeting(
  phase: GameDayPhase,
  firstName: string,
  atmosphereEmoji: string
): string {
  switch (phase) {
    case "morning":
      return `${atmosphereEmoji} Good Morning, ${firstName}`;
    case "afternoon":
      return `${atmosphereEmoji} Good Afternoon, ${firstName}`;
    case "evening":
      return `${atmosphereEmoji} Welcome Back, ${firstName}`;
    case "night":
      return `${atmosphereEmoji} Great Game Day, ${firstName}`;
  }
}
