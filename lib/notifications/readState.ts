"use client";

const STORAGE_PREFIX = "sb-notifications-read";
const ARCHIVE_PREFIX = "sb-notifications-archived";
const DELETED_PREFIX = "sb-notifications-deleted";

function storageKey(email: string): string {
  return `${STORAGE_PREFIX}:${email.trim().toLowerCase()}`;
}

function archiveKey(email: string): string {
  return `${ARCHIVE_PREFIX}:${email.trim().toLowerCase()}`;
}

function deletedKey(email: string): string {
  return `${DELETED_PREFIX}:${email.trim().toLowerCase()}`;
}

function loadIdList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveIdList(key: string, ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(ids.slice(0, 200)));
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

export function loadArchivedNotificationIds(email: string): string[] {
  if (!email) return [];
  return loadIdList(archiveKey(email));
}

export function loadDeletedNotificationIds(email: string): string[] {
  if (!email) return [];
  return loadIdList(deletedKey(email));
}

export function archiveNotifications(email: string, ids: string[]): string[] {
  const existing = new Set(loadArchivedNotificationIds(email));
  for (const id of ids) existing.add(id);
  const merged = Array.from(existing);
  saveIdList(archiveKey(email), merged);
  return merged;
}

export function deleteNotifications(email: string, ids: string[]): string[] {
  const existing = new Set(loadDeletedNotificationIds(email));
  for (const id of ids) existing.add(id);
  const merged = Array.from(existing);
  saveIdList(deletedKey(email), merged);
  return merged;
}
