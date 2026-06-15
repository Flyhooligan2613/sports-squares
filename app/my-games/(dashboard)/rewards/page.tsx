import type { Metadata } from "next";
import RewardsDashboardPanel from "@/components/player/ecosystem/RewardsDashboardPanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `My Rewards | ${BRAND_NAME}`,
};

export default function RewardsDashboardPage() {
  return <RewardsDashboardPanel />;
}
