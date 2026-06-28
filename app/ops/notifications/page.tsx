import type { Metadata } from "next";
import dynamic from "next/dynamic";
import OpsModuleSkeleton from "@/components/operations/pages/OpsModuleSkeleton";

const OpsModuleView = dynamic(
  () => import("@/components/operations/pages/OpsModuleView"),
  { loading: () => <OpsModuleSkeleton /> },
);

export const metadata: Metadata = {
  title: "Notifications",
};

export default function NotificationsPage() {
  return <OpsModuleView moduleId="notifications" />;
}
