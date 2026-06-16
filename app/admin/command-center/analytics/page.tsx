import dynamic from "next/dynamic";
import SectionPlaceholder from "@/components/admin/commandCenter/SectionPlaceholder";

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
      <SectionPlaceholder
        title="Analytics Center"
        description="Filterable platform metrics — heavy charts lazy-loaded below."
        deferred={[
          "AnalyticsEngine time-series integration",
          "Contest conversion funnel",
          "Cohort retention views",
        ]}
      />
      <AnalyticsCharts />
    </div>
  );
}
