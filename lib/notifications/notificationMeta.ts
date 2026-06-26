import type { PlayerNotification } from "@/lib/player/dashboardTypes";

/** Player-facing notification categories for filtering and preferences. */
export type NotificationCategory =
  | "contest"
  | "wallet"
  | "rewards"
  | "community"
  | "system"
  | "security"
  | "announcements"
  | "support";

export const NOTIFICATION_CATEGORY_TABS: Array<{
  id: NotificationCategory | "all";
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "contest", label: "Contest" },
  { id: "wallet", label: "Wallet" },
  { id: "rewards", label: "Rewards" },
  { id: "community", label: "Community" },
  { id: "announcements", label: "Announcements" },
  { id: "security", label: "Security" },
  { id: "support", label: "Support" },
  { id: "system", label: "System" },
];

const CATEGORY_BY_TYPE: Record<PlayerNotification["type"], NotificationCategory> = {
  board_filled: "contest",
  numbers_assigned: "contest",
  game_starting: "contest",
  pickem_week_open: "contest",
  pickem_pool_almost_full: "contest",
  pickem_pool_full: "contest",
  pickem_sunday_complete: "contest",
  pickem_championship: "contest",
  pickem_prediction_due: "contest",
  pickem_prediction_locked: "contest",
  payment_sent: "wallet",
  pickem_payout: "wallet",
  quarter_winner: "rewards",
  pickem_winner: "rewards",
  pickem_streak: "rewards",
  pickem_rank_up: "rewards",
  pickem_achievement: "rewards",
  platform_announcement: "announcements",
};

export function getNotificationCategory(
  type: PlayerNotification["type"]
): NotificationCategory {
  return CATEGORY_BY_TYPE[type] ?? "system";
}

export const NOTIFICATION_ICONS: Record<PlayerNotification["type"], string> = {
  board_filled: "📋",
  numbers_assigned: "🎯",
  quarter_winner: "🏆",
  payment_sent: "💰",
  game_starting: "🏈",
  pickem_week_open: "🏈",
  pickem_pool_almost_full: "🔥",
  pickem_pool_full: "✅",
  pickem_sunday_complete: "📊",
  pickem_championship: "👑",
  pickem_prediction_due: "⏱",
  pickem_prediction_locked: "🔒",
  pickem_winner: "🏆",
  pickem_payout: "💰",
  pickem_streak: "🔥",
  pickem_rank_up: "📈",
  pickem_achievement: "⭐",
  platform_announcement: "📣",
};

export interface NotificationDisplayMeta {
  category: NotificationCategory;
  icon: string;
  status: "unread" | "read" | "archived";
  ctaLabel: string | null;
  ctaHref: string | null;
}

const CTA_BY_TYPE: Partial<
  Record<PlayerNotification["type"], { label: string; href: string | ((n: PlayerNotification) => string) }>
> = {
  board_filled: { label: "View board", href: "/my-games" },
  numbers_assigned: { label: "View board", href: "/my-games" },
  quarter_winner: { label: "View winnings", href: "/my-games/winnings" },
  payment_sent: { label: "Open wallet", href: "/my-games/wallet" },
  game_starting: { label: "Follow live", href: "/my-games" },
  pickem_week_open: { label: "Make picks", href: "/contest-center" },
  pickem_pool_almost_full: { label: "Join contest", href: "/contest-center" },
  pickem_pool_full: { label: "View pool", href: "/contest-center" },
  pickem_sunday_complete: { label: "View standings", href: "/contest-center" },
  pickem_championship: { label: "View results", href: "/contest-center" },
  pickem_prediction_due: { label: "Lock picks", href: "/contest-center" },
  pickem_prediction_locked: { label: "View standings", href: "/contest-center" },
  pickem_winner: { label: "View winnings", href: "/my-games/winnings" },
  pickem_payout: { label: "Open wallet", href: "/my-games/wallet" },
  pickem_streak: { label: "View rewards", href: "/my-games/rewards" },
  pickem_rank_up: { label: "View rankings", href: "/leaderboards" },
  pickem_achievement: { label: "View achievements", href: "/my-games/rewards/achievements" },
  platform_announcement: { label: "Learn more", href: "/contest-center" },
};

function resolveHref(
  href: string | ((n: PlayerNotification) => string),
  notification: PlayerNotification
): string {
  return typeof href === "function" ? href(notification) : href;
}

export function getNotificationDisplayMeta(
  notification: PlayerNotification,
  options?: { isRead?: boolean; isArchived?: boolean }
): NotificationDisplayMeta {
  const category = getNotificationCategory(notification.type);
  const cta = CTA_BY_TYPE[notification.type];
  const ctaHref = notification.href ?? (cta ? resolveHref(cta.href, notification) : null);

  return {
    category,
    icon: NOTIFICATION_ICONS[notification.type],
    status: options?.isArchived ? "archived" : options?.isRead ? "read" : "unread",
    ctaLabel: cta?.label ?? (ctaHref ? "View" : null),
    ctaHref,
  };
}

export function matchesNotificationSearch(
  notification: PlayerNotification,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const category = getNotificationCategory(notification.type);
  return (
    notification.title.toLowerCase().includes(q) ||
    notification.detail.toLowerCase().includes(q) ||
    category.includes(q)
  );
}
