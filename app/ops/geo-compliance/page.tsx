import type { Metadata } from "next";
import dynamic from "next/dynamic";
import OpsModuleSkeleton from "@/components/operations/pages/OpsModuleSkeleton";

const GeoComplianceCenter = dynamic(
  () => import("@/components/operations/geo-compliance/GeoComplianceCenter"),
  { loading: () => <OpsModuleSkeleton /> },
);

export const metadata: Metadata = {
  title: "Geo Compliance",
};

export default function GeoCompliancePage() {
  return <GeoComplianceCenter />;
}
