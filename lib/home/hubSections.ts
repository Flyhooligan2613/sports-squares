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
  rewards: "game-room-rewards",
  ecosystem: "ecosystem",
  pools: "pools",
} as const;

export type HubSectionId = (typeof HUB_SECTION)[keyof typeof HUB_SECTION];
export type HubSectionKey = keyof typeof HUB_SECTION;

export const GAME_DAY_HREF = "/my-games?mode=gameday";
export const GAME_ROOM_HREF = "/my-games?mode=home";

export const HUB_PENDING_HASH_KEY = "squareboards:hub-pending-hash";

export function gameDaySection(section: HubSectionKey): string {
  return `${GAME_DAY_HREF}#${HUB_SECTION[section]}`;
}

export function gameRoomSection(section: HubSectionKey): string {
  return `${GAME_ROOM_HREF}#${HUB_SECTION[section]}`;
}

export function hubSectionAnchorClassName(extra = ""): string {
  return ["hub-section-anchor", extra].filter(Boolean).join(" ");
}

export type HubViewMode = "home" | "gameday";

export function normalizeHubViewMode(mode: string | null | undefined): HubViewMode {
  return mode === "home" ? "home" : "gameday";
}

export function hubViewModesMatch(
  currentMode: string | null | undefined,
  targetMode: string | null | undefined
): boolean {
  return normalizeHubViewMode(currentMode) === normalizeHubViewMode(targetMode);
}

export function setPendingHubHash(sectionId: string): void {
  try {
    sessionStorage.setItem(HUB_PENDING_HASH_KEY, sectionId);
  } catch {
    /* ignore */
  }
}

export function consumePendingHubHash(): string | null {
  try {
    const hash = sessionStorage.getItem(HUB_PENDING_HASH_KEY);
    if (hash) sessionStorage.removeItem(HUB_PENDING_HASH_KEY);
    return hash || null;
  } catch {
    return null;
  }
}

export function peekPendingHubHash(): string | null {
  try {
    return sessionStorage.getItem(HUB_PENDING_HASH_KEY);
  } catch {
    return null;
  }
}

export function parseHubHash(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "").trim();
  return hash || null;
}

export function resolveHubTargetHash(): string | null {
  return parseHubHash() || consumePendingHubHash();
}

export function scrollToHubSection(sectionId: string, behavior: ScrollBehavior = "auto"): boolean {
  const el = document.getElementById(sectionId);
  if (!el) return false;
  el.scrollIntoView({ behavior, block: "start" });
  return true;
}

export interface HubSectionTab {
  id: string;
  label: string;
  section?: HubSectionKey;
  emoji?: string;
  /** When set, navigates to a route instead of a hub section anchor. */
  directHref?: string;
}

export const GAME_DAY_SECTION_TABS: HubSectionTab[] = [
  { id: "status", label: "Today", section: "status", emoji: "📊" },
  { id: "continue", label: "Continue", section: "continue", emoji: "▶️" },
  { id: "missions", label: "Missions", section: "missions", emoji: "✨" },
  { id: "wallet", label: "Wallet", directHref: "/my-games/wallet", emoji: "💳" },
  { id: "liveActivity", label: "Live", section: "liveActivity", emoji: "🔴" },
  { id: "todaysGames", label: "Games", section: "todaysGames", emoji: "🏈" },
  { id: "whatsNext", label: "Next Up", section: "whatsNext", emoji: "➡️" },
];

export const GAME_ROOM_SECTION_TABS: HubSectionTab[] = [
  { id: "continue", label: "Continue", section: "continue", emoji: "▶️" },
  { id: "dailyStory", label: "Story", section: "dailyStory", emoji: "📖" },
  { id: "browse", label: "Browse", section: "browse", emoji: "🎮" },
  { id: "friends", label: "Friends", section: "friends", emoji: "👥" },
  { id: "progression", label: "Progress", section: "progression", emoji: "⭐" },
  { id: "rewards", label: "Rewards", section: "rewards", emoji: "🎁" },
];
