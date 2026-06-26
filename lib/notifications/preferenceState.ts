"use client";

import type { NotificationCategory } from "@/lib/notifications/notificationMeta";

const STORAGE_PREFIX = "sb-notification-prefs";

export interface NotificationPreferences {
  contest: boolean;
  wallet: boolean;
  rewards: boolean;
  community: boolean;
  security: boolean;
  announcements: boolean;
  support: boolean;
  system: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  contest: true,
  wallet: true,
  rewards: true,
  community: true,
  security: true,
  announcements: true,
  support: true,
  system: true,
  emailEnabled: true,
  pushEnabled: true,
};

function storageKey(email: string): string {
  return `${STORAGE_PREFIX}:${email.trim().toLowerCase()}`;
}

export function loadNotificationPreferences(email: string): NotificationPreferences {
  if (typeof window === "undefined" || !email) {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
  try {
    const raw = localStorage.getItem(storageKey(email));
    if (!raw) return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...parsed };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
}

export function saveNotificationPreferences(
  email: string,
  prefs: NotificationPreferences
): void {
  if (typeof window === "undefined" || !email) return;
  localStorage.setItem(storageKey(email), JSON.stringify(prefs));
}

export function isCategoryEnabled(
  prefs: NotificationPreferences,
  category: NotificationCategory
): boolean {
  return prefs[category] !== false;
}

export const PREFERENCE_CATEGORY_LABELS: Array<{
  key: keyof Pick<
    NotificationPreferences,
    | "contest"
    | "wallet"
    | "rewards"
    | "community"
    | "security"
    | "announcements"
    | "support"
    | "system"
  >;
  label: string;
  description: string;
}> = [
  {
    key: "contest",
    label: "Contest alerts",
    description: "Board updates, kickoffs, and pick deadlines.",
  },
  {
    key: "wallet",
    label: "Wallet",
    description: "Deposits, payouts, and balance updates.",
  },
  {
    key: "rewards",
    label: "Rewards",
    description: "Wins, achievements, streaks, and tier progress.",
  },
  {
    key: "community",
    label: "Community",
    description: "Huddle activity and social highlights.",
  },
  {
    key: "security",
    label: "Security",
    description: "Sign-ins, devices, and account protection.",
  },
  {
    key: "announcements",
    label: "Announcements",
    description: "Platform news and featured events.",
  },
  {
    key: "support",
    label: "Support",
    description: "Replies from the SquareBoards support team.",
  },
  {
    key: "system",
    label: "System",
    description: "Maintenance and account notices.",
  },
];
