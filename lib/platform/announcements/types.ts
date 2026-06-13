export type AnnouncementDisplayType =
  | "welcome_popup"
  | "top_banner"
  | "notification_card"
  | "homepage_hero"
  | "scrolling_ticker"
  | "floating_toast"
  | "live_event_banner";

export type AnnouncementCategory =
  | "nfl_week_open"
  | "thursday_night"
  | "sunday_gameday"
  | "monday_tiebreaker"
  | "holiday"
  | "promotion"
  | "giveaway"
  | "maintenance"
  | "feature_release"
  | "new_game"
  | "personalized";

export type AnnouncementAudience =
  | "all"
  | "anonymous"
  | "new_players"
  | "returning_players"
  | "squares_players"
  | "pickem_players"
  | "vip_players"
  | "active_boards_players"
  | "no_purchases_players"
  | "email_list";

export type AnnouncementFrequency =
  | "once"
  | "daily"
  | "weekly"
  | "always"
  | "every_login"
  | "until_dismissed"
  | "never_after_click";

export type AnnouncementPriorityLevel = "critical" | "high" | "normal" | "low";

export type AnnouncementAnimationStyle = "fade" | "scale" | "slide_up";

export type AnnouncementEventType = "view" | "dismiss" | "click" | "secondary_click";

export interface PlatformAnnouncement {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  destinationHref: string | null;
  secondaryButtonText: string | null;
  secondaryDestinationHref: string | null;
  displayType: AnnouncementDisplayType;
  category: AnnouncementCategory;
  audience: AnnouncementAudience;
  audienceRegions: string[];
  audienceEmails: string[];
  priority: number;
  priorityLevel: AnnouncementPriorityLevel;
  dismissible: boolean;
  frequency: AnnouncementFrequency;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  animationStyle: AnnouncementAnimationStyle;
  active: boolean;
  createdBy: string | null;
  automationKey: string | null;
  templateKey: string | null;
  source: "manual" | "automated";
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementUpsertInput {
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  buttonText?: string | null;
  destinationHref?: string | null;
  secondaryButtonText?: string | null;
  secondaryDestinationHref?: string | null;
  displayType: AnnouncementDisplayType;
  category: AnnouncementCategory;
  audience: AnnouncementAudience;
  audienceRegions?: string[];
  audienceEmails?: string[];
  priority?: number;
  priorityLevel?: AnnouncementPriorityLevel;
  dismissible?: boolean;
  frequency?: AnnouncementFrequency;
  startsAt?: string;
  endsAt?: string | null;
  timezone?: string;
  animationStyle?: AnnouncementAnimationStyle;
  active?: boolean;
  templateKey?: string | null;
}

export interface AnnouncementAnalytics {
  views: number;
  dismissals: number;
  clicks: number;
  secondaryClicks: number;
  uniqueReach: number;
  clickThroughRate: number;
  conversionRate: number;
}

export interface AnnouncementTemplate {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  payload: AnnouncementUpsertInput;
  createdAt: string;
  updatedAt: string;
}

export interface ViewerContext {
  email: string | null;
  viewerKey: string;
  isAnonymous: boolean;
  isNewPlayer: boolean;
  isReturningPlayer: boolean;
  isSquaresPlayer: boolean;
  isPickemPlayer: boolean;
  isVipPlayer: boolean;
  hasActiveBoards: boolean;
  hasNoPurchases: boolean;
  region: string | null;
}

export const PRIORITY_LEVEL_VALUES: Record<AnnouncementPriorityLevel, number> = {
  critical: 100,
  high: 75,
  normal: 50,
  low: 25,
};

export function priorityLevelFromValue(priority: number): AnnouncementPriorityLevel {
  if (priority >= 90) return "critical";
  if (priority >= 65) return "high";
  if (priority >= 35) return "normal";
  return "low";
}

export function resolvePriority(input: {
  priorityLevel?: AnnouncementPriorityLevel;
  priority?: number;
}): { priority: number; priorityLevel: AnnouncementPriorityLevel } {
  if (input.priorityLevel) {
    return {
      priorityLevel: input.priorityLevel,
      priority: PRIORITY_LEVEL_VALUES[input.priorityLevel],
    };
  }
  const priority = input.priority ?? PRIORITY_LEVEL_VALUES.normal;
  return { priority, priorityLevel: priorityLevelFromValue(priority) };
}

export const DISPLAY_TYPE_LABELS: Record<AnnouncementDisplayType, string> = {
  welcome_popup: "Full-Screen Popup",
  top_banner: "Top Banner",
  notification_card: "Notification Card",
  homepage_hero: "Hero Banner",
  scrolling_ticker: "Scrolling Ticker",
  floating_toast: "Floating Toast",
  live_event_banner: "Live Event Banner",
};

export const CATEGORY_LABELS: Record<AnnouncementCategory, string> = {
  nfl_week_open: "NFL Week Opens",
  thursday_night: "Thursday Night Football",
  sunday_gameday: "Sunday Game Day",
  monday_tiebreaker: "Monday Championship Tiebreaker",
  holiday: "Holiday Events",
  promotion: "Promotions",
  giveaway: "Giveaways",
  maintenance: "System Maintenance",
  feature_release: "Feature Releases",
  new_game: "New Game Launches",
  personalized: "Personalized Messages",
};

export const AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
  all: "Everyone",
  anonymous: "New Visitors (Not Signed In)",
  new_players: "New Users",
  returning_players: "Returning Users",
  squares_players: "Squares Players",
  pickem_players: "Pick'em Players",
  vip_players: "VIP Players",
  active_boards_players: "Players with Active Boards",
  no_purchases_players: "Players with No Purchases",
  email_list: "Specific Email List",
};

export const FREQUENCY_LABELS: Record<AnnouncementFrequency, string> = {
  once: "Show Once",
  daily: "Show Daily",
  weekly: "Show Weekly",
  always: "Every Visit",
  every_login: "Every Login",
  until_dismissed: "Until Dismissed",
  never_after_click: "Never After Click",
};

export const PRIORITY_LEVEL_LABELS: Record<AnnouncementPriorityLevel, string> = {
  critical: "Critical",
  high: "High",
  normal: "Normal",
  low: "Low",
};

export const ANIMATION_STYLE_LABELS: Record<AnnouncementAnimationStyle, string> = {
  fade: "Fade",
  scale: "Scale",
  slide_up: "Slide Up",
};

export const BUTTON_DESTINATION_PRESETS = [
  { label: "Browse Boards", href: "/boards" },
  { label: "Play Pick'em", href: "/pickem/week" },
  { label: "View Leaderboards", href: "/pickem/leaderboard" },
  { label: "Hall of Fame", href: "/pickem/hall-of-fame" },
  { label: "My Games", href: "/my-games" },
  { label: "Live TV", href: "/live-tv" },
  { label: "Support", href: "/support" },
  { label: "Homepage", href: "/" },
] as const;

export const IMAGE_SIZE_GUIDES = [
  { label: "Portrait (recommended for popups)", size: "1080 × 1350" },
  { label: "Landscape hero", size: "1920 × 1080" },
  { label: "Square", size: "1080 × 1080" },
] as const;
