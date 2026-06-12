"use client";

const STORAGE_PREFIX = "sb-notifications-read";

function storageKey(email: string): string {
  return `${STORAGE_PREFIX}:${email.trim().toLowerCase()}`;
}

export function loadReadNotificationIds(email: string): string[] {
  if (typeof window === "undefined" || !email) return [];
  try {
    const raw = localStorage.getItem(storageKey(email));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReadNotificationIds(email: string, ids: string[]): void {
  if (typeof window === "undefined" || !email) return;
  localStorage.setItem(storageKey(email), JSON.stringify(ids.slice(0, 200)));
}

export function markNotificationsRead(email: string, ids: string[]): string[] {
  const existing = new Set(loadReadNotificationIds(email));
  for (const id of ids) existing.add(id);
  const merged = Array.from(existing);
  saveReadNotificationIds(email, merged);
  return merged;
}

export function markAllNotificationsRead(
  email: string,
  notificationIds: string[]
): string[] {
  return markNotificationsRead(email, notificationIds);
}
