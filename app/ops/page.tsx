import type { Metadata } from "next";
import dynamic from "next/dynamic";
import OpsModuleSkeleton from "@/components/operations/pages/OpsModuleSkeleton";

const OpsDashboardView = dynamic(
  () => import("@/components/operations/pages/OpsDashboardView"),
  { loading: () => <OpsModuleSkeleton /> },
);

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function OpsDashboardPage() {
  return <OpsDashboardView />;
}
