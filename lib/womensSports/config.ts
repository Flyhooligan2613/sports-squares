/**
 * Women's Sports Hub™ foundation — config-driven expansion for women's competitions.
 * WNBA is the inaugural entry; future sports plug in via this registry.
 */

export type WomensSportStatus = "available" | "coming_soon" | "scaffold";

export interface WomensSportEntry {
  id: string;
  label: string;
  emoji: string;
  status: WomensSportStatus;
  squaresHref: string | null;
  pickemHref: string | null;
  contestCenterSportKey: string;
  description: string;
  highlightSportId: string;
  espnPath: string;
}

export const WOMENS_SPORTS_HUB: WomensSportEntry[] = [
  {
    id: "wnba",
    label: "WNBA",
    emoji: "🏀",
    status: "available",
    squaresHref: "/games/wnba",
    pickemHref: "/wnba-pickem",
    contestCenterSportKey: "wnba",
    description:
      "Women's basketball at the highest level — Sports Squares™, Pick'em Royale™, and Highlight Squares™ on every tip-off.",
    highlightSportId: "wnba",
    espnPath: "basketball/wnba",
  },
  {
    id: "nwsl",
    label: "NWSL",
    emoji: "⚽",
    status: "scaffold",
    squaresHref: null,
    pickemHref: null,
    contestCenterSportKey: "nwsl",
    description: "National Women's Soccer League — coming to the Women's Sports Hub™.",
    highlightSportId: "nwsl",
    espnPath: "soccer/usa.nwsl",
  },
  {
    id: "ncaa-wbb",
    label: "NCAA Women's Basketball",
    emoji: "🏀",
    status: "scaffold",
    squaresHref: null,
    pickemHref: null,
    contestCenterSportKey: "ncaa-wbb",
    description: "March Madness energy, year-round — scaffolded for future integration.",
    highlightSportId: "ncaab-w",
    espnPath: "basketball/womens-college-basketball",
  },
  {
    id: "pwhl",
    label: "PWHL",
    emoji: "🏒",
    status: "scaffold",
    squaresHref: null,
    pickemHref: null,
    contestCenterSportKey: "pwhl",
    description: "Professional Women's Hockey League — future Women's Sports Hub™ entry.",
    highlightSportId: "pwhl",
    espnPath: "hockey/pwhl",
  },
];

export const WOMENS_SPORTS_HUB_TAGLINE =
  "One hub for women's competition — legacy, community, and game-day energy.";

export function getWomensSport(id: string): WomensSportEntry | undefined {
  return WOMENS_SPORTS_HUB.find((entry) => entry.id === id);
}

export function availableWomensSports(): WomensSportEntry[] {
  return WOMENS_SPORTS_HUB.filter((entry) => entry.status === "available");
}
