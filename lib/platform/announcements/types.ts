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
  | "vip_players";

export type AnnouncementFrequency = "once" | "daily" | "weekly" | "always";

export interface PlatformAnnouncement {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  destinationHref: string | null;
  displayType: AnnouncementDisplayType;
  category: AnnouncementCategory;
  audience: AnnouncementAudience;
  audienceRegions: string[];
  priority: number;
  dismissible: boolean;
  frequency: AnnouncementFrequency;
  startsAt: string;
  endsAt: string | null;
  active: boolean;
  createdBy: string | null;
  automationKey: string | null;
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
  displayType: AnnouncementDisplayType;
  category: AnnouncementCategory;
  audience: AnnouncementAudience;
  audienceRegions?: string[];
  priority?: number;
  dismissible?: boolean;
  frequency?: AnnouncementFrequency;
  startsAt?: string;
  endsAt?: string | null;
  active?: boolean;
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
  region: string | null;
}

export const DISPLAY_TYPE_LABELS: Record<AnnouncementDisplayType, string> = {
  welcome_popup: "Welcome Popup",
  top_banner: "Top Banner",
  notification_card: "Notification Card",
  homepage_hero: "Homepage Hero Banner",
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
  all: "All Players",
  anonymous: "Visitors (Not Signed In)",
  new_players: "New Players",
  returning_players: "Returning Players",
  squares_players: "Squares Players",
  pickem_players: "Pick'em Players",
  vip_players: "VIP Players",
};

export const FREQUENCY_LABELS: Record<AnnouncementFrequency, string> = {
  once: "Show Once",
  daily: "Show Daily",
  weekly: "Show Weekly",
  always: "Every Visit",
};
