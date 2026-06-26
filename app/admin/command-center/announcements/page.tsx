import { Megaphone } from "lucide-react";
import ComingSoonSection from "@/components/admin/commandCenter/ComingSoonSection";

export default function CommandCenterAnnouncementsPage() {
  return (
    <ComingSoonSection
      title="Announcements"
      description="Broadcast studio and targeting live in Classic Admin. Command Center views for delivery analytics and automation are rolling out."
      icon={Megaphone}
      capabilities={[
        { label: "Announcement Studio (Classic Admin)", status: "live" },
        { label: "Push notification campaigns", status: "live" },
        { label: "Delivery analytics dashboard", status: "planned" },
        { label: "Audience segmentation preview", status: "planned" },
        { label: "Scheduled broadcast automation", status: "planned" },
      ]}
      relatedLinks={[
        { href: "/admin/announcements", label: "Open Announcement Studio" },
        { href: "/admin/push-notifications", label: "Push Alerts admin" },
        { href: "/trust", label: "Trust Center" },
      ]}
    />
  );
}
