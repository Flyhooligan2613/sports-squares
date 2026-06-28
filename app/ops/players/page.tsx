import type { Metadata } from "next";
import dynamic from "next/dynamic";
import OpsModuleSkeleton from "@/components/operations/pages/OpsModuleSkeleton";

const OpsModuleView = dynamic(
  () => import("@/components/operations/pages/OpsModuleView"),
  { loading: () => <OpsModuleSkeleton /> },
);

export const metadata: Metadata = {
  title: "Players",
};

export default function PlayersPage() {
  return <OpsModuleView moduleId="players" />;
}
