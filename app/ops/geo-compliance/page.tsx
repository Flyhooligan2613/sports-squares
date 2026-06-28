import type { Metadata } from "next";
import dynamic from "next/dynamic";
import OpsModuleSkeleton from "@/components/operations/pages/OpsModuleSkeleton";

const OpsModuleView = dynamic(
  () => import("@/components/operations/pages/OpsModuleView"),
  { loading: () => <OpsModuleSkeleton /> },
);

export const metadata: Metadata = {
  title: "Geo Compliance",
};

export default function GeoCompliancePage() {
  return <OpsModuleView moduleId="geo-compliance" />;
}
