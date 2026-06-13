import type { Metadata } from "next";
import RewardsDashboardPanel from "@/components/player/ecosystem/RewardsDashboardPanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Rewards Dashboard | ${BRAND_NAME}`,
};

export default function RewardsDashboardPage() {
  return <RewardsDashboardPanel />;
}
