/** Stable anchor IDs for Game Day + Game Room hub sections. */

export const HUB_SECTION = {
  missions: "game-day-missions",
  forYou: "game-day-for-you",
  continue: "game-day-continue",
  status: "game-day-status",
  liveActivity: "game-day-live",
  todaysGames: "game-day-todays-games",
  snapshot: "game-day-snapshot",
  whatsNext: "game-day-whats-next",
  timeline: "game-day-timeline",
  friends: "game-room-friends",
  progression: "game-room-progression",
  dailyStory: "game-room-daily-story",
  browse: "game-room-browse",
} as const;

export type HubSectionId = (typeof HUB_SECTION)[keyof typeof HUB_SECTION];

export const GAME_DAY_HREF = "/my-games?mode=gameday";
export const GAME_ROOM_HREF = "/my-games?mode=home";

export function gameDaySection(section: keyof typeof HUB_SECTION): string {
  return `${GAME_DAY_HREF}#${HUB_SECTION[section]}`;
}

export function gameRoomSection(section: keyof typeof HUB_SECTION): string {
  return `${GAME_ROOM_HREF}#${HUB_SECTION[section]}`;
}

export function hubSectionAnchorClassName(extra = ""): string {
  return ["hub-section-anchor", extra].filter(Boolean).join(" ");
}

export function parseHubHash(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "").trim();
  return hash || null;
}

export function scrollToHubSection(sectionId: string, behavior: ScrollBehavior = "smooth"): boolean {
  const el = document.getElementById(sectionId);
  if (!el) return false;
  el.scrollIntoView({ behavior, block: "start" });
  return true;
}
