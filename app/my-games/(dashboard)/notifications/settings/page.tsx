import type { Metadata } from "next";
import NotificationSettingsPanel from "@/components/player/NotificationSettingsPanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Notification Settings | ${BRAND_NAME}`,
};

export default function NotificationSettingsPage() {
  return <NotificationSettingsPanel />;
}
