import type { Metadata } from "next";
import NotificationCenter from "@/components/player/NotificationCenter";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Notifications | ${BRAND_NAME}`,
};

export default function NotificationsPage() {
  return <NotificationCenter />;
}
