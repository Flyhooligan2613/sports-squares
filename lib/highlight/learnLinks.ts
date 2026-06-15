import type { EspnSport } from "@/lib/types";

export function learnHowToPlayHref(sport: EspnSport): string {
  if (sport === "mlb") return "/learn/mlb-squares";
  return "/learn/how-to-play";
}
