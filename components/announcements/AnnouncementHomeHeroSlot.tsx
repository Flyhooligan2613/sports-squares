"use client";

import { useAnnouncements } from "@/components/announcements/AnnouncementProvider";
import { AnnouncementHomeHero } from "@/components/announcements/AnnouncementDisplays";

export default function AnnouncementHomeHeroSlot() {
  const { homeHero } = useAnnouncements();
  if (!homeHero) return null;
  return <AnnouncementHomeHero announcement={homeHero} />;
}
