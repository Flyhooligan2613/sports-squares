import dynamic from "next/dynamic";
import { BarChart3 } from "lucide-react";
import ComingSoonSection from "@/components/admin/commandCenter/ComingSoonSection";
import SquarePassAnalyticsPanel from "@/components/admin/commandCenter/SquarePassAnalyticsPanel";

const AnalyticsCharts = dynamic(
  () => import("@/components/admin/commandCenter/AnalyticsCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 rounded-xl bg-white/[0.04] animate-pulse" />
    ),
  }
);

export default function AnalyticsCenterPage() {
  return (
    <div className="space-y-6">
      <ComingSoonSection
        title="Analytics Center"
        description="Platform-wide funnels and cohort views are rolling out. SquarePass™ metrics and contest charts below are live today."
        icon={BarChart3}
        capabilities={[
          { label: "SquarePass promotion analytics", status: "live" },
          { label: "Contest volume charts", status: "live" },
          { label: "AnalyticsEngine time-series", status: "planned" },
          { label: "Contest conversion funnel", status: "planned" },
          { label: "Cohort retention views", status: "planned" },
        ]}
        relatedLinks={[
          { href: "/admin/command-center", label: "Command Center dashboard" },
          { href: "/admin/square-pass", label: "SquarePass admin" },
        ]}
      />
      <SquarePassAnalyticsPanel />
      <AnalyticsCharts />
    </div>
  );
}
