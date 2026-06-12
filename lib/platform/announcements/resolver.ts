import {
  listDismissalsForViewer,
  listScheduledAnnouncements,
} from "@/lib/platform/announcements/db";
import { applyFrequencyFilter } from "@/lib/platform/announcements/frequency";
import {
  filterAnnouncementsForViewer,
  resolveViewerContext,
} from "@/lib/platform/announcements/targeting";
import type { PlatformAnnouncement } from "@/lib/platform/announcements/types";

export async function getActiveAnnouncementsForViewer(input: {
  email: string | null;
  anonymousId?: string | null;
  region?: string | null;
  displayType?: PlatformAnnouncement["displayType"];
}): Promise<PlatformAnnouncement[]> {
  const viewer = await resolveViewerContext(input);
  const [scheduled, dismissals] = await Promise.all([
    listScheduledAnnouncements(),
    listDismissalsForViewer(viewer.viewerKey),
  ]);

  let filtered = filterAnnouncementsForViewer(scheduled, viewer);
  filtered = applyFrequencyFilter(filtered, dismissals);

  if (input.displayType) {
    filtered = filtered.filter((a) => a.displayType === input.displayType);
  }

  return filtered;
}
