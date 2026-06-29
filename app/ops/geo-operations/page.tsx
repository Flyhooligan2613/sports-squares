import type { Metadata } from "next";
import dynamic from "next/dynamic";
import OpsModuleSkeleton from "@/components/operations/pages/OpsModuleSkeleton";

const GeoOperationsCenter = dynamic(
  () => import("@/components/operations/geo-operations/GeoOperationsCenter"),
  { loading: () => <OpsModuleSkeleton /> },
);

export const metadata: Metadata = {
  title: "Geo Operations",
};

export default function GeoOperationsPage() {
  return <GeoOperationsCenter />;
}
