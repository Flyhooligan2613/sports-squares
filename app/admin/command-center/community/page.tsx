import { Users } from "lucide-react";
import ComingSoonSection from "@/components/admin/commandCenter/ComingSoonSection";

export default function CommunityMonitorPage() {
  return (
    <ComingSoonSection
      title="Community Monitor"
      description="Huddle activity, reputation signals, and engagement metrics will aggregate CommunityCore events into a single ops view."
      icon={Users}
      capabilities={[
        { label: "Live activity feed (Huddle wins)", status: "live" },
        { label: "Command Center competitor stats", status: "live" },
        { label: "CommunityCore event subscription feed", status: "planned" },
        { label: "Huddle win highlights aggregation", status: "planned" },
        { label: "Reputation tier distribution charts", status: "planned" },
      ]}
      relatedLinks={[
        { href: "/admin/command-center", label: "Dashboard activity feed" },
        { href: "/admin/ecosystem", label: "Ecosystem admin" },
      ]}
    />
  );
}
