import Link from "next/link";
import SectionPlaceholder from "@/components/admin/commandCenter/SectionPlaceholder";

export default function SupportCenterPage() {
  return (
    <div className="space-y-4">
      <SectionPlaceholder
        title="Support Center"
        description="Support thread metrics appear in the Live Activity Feed. Full inbox remains in the legacy admin."
        deferred={[
          "SLA metrics and response-time charts",
          "Agent assignment workflow",
          "Support volume trend analytics",
        ]}
      />
      <Link href="/admin/support" className="text-sm text-sb-glow hover:text-white inline-block">
        Open Support Inbox →
      </Link>
    </div>
  );
}
