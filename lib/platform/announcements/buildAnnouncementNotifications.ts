import { getActiveAnnouncementsForViewer } from "@/lib/platform/announcements/resolver";
import type { PlayerNotification } from "@/lib/player/dashboardTypes";

export async function buildAnnouncementNotifications(
  email: string
): Promise<PlayerNotification[]> {
  const announcements = await getActiveAnnouncementsForViewer({
    email,
    displayType: "notification_card",
  });

  return announcements.map((item) => ({
    id: `announcement-${item.id}`,
    type: "platform_announcement" as const,
    title: item.title,
    detail: item.subtitle ?? item.buttonText ?? "Platform update",
    at: item.startsAt,
    href: item.destinationHref ?? undefined,
    announcementId: item.id,
  }));
}
