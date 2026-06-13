import type {
  AnnouncementFrequency,
  PlatformAnnouncement,
} from "@/lib/platform/announcements/types";

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfWeek(d: Date): Date {
  const copy = startOfDay(d);
  const day = copy.getDay();
  const diff = day === 0 ? 6 : day - 1;
  copy.setDate(copy.getDate() - diff);
  return copy;
}

export function shouldShowAnnouncement(input: {
  announcement: PlatformAnnouncement;
  dismissedAt: string | null;
  clicked?: boolean;
  now?: Date;
}): boolean {
  const { announcement, dismissedAt, clicked = false } = input;
  const now = input.now ?? new Date();

  if (announcement.frequency === "never_after_click" && clicked) return false;

  if (announcement.frequency === "until_dismissed" || announcement.frequency === "once") {
    if (dismissedAt) return false;
    return true;
  }

  if (!dismissedAt) return true;

  switch (announcement.frequency as AnnouncementFrequency) {
    case "daily":
      return new Date(dismissedAt) < startOfDay(now);
    case "weekly":
      return new Date(dismissedAt) < startOfWeek(now);
    case "always":
    case "every_login":
      return true;
    default:
      return false;
  }
}

export function applyFrequencyFilter(
  announcements: PlatformAnnouncement[],
  dismissals: { announcementId: string; dismissedAt: string }[],
  clicks: { announcementId: string }[] = []
): PlatformAnnouncement[] {
  const dismissalMap = new Map(
    dismissals.map((d) => [d.announcementId, d.dismissedAt])
  );
  const clickedIds = new Set(clicks.map((c) => c.announcementId));

  return announcements.filter((announcement) =>
    shouldShowAnnouncement({
      announcement,
      dismissedAt: dismissalMap.get(announcement.id) ?? null,
      clicked: clickedIds.has(announcement.id),
    })
  );
}
