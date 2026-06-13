import type { Metadata } from "next";
import RewardHistoryPanel from "@/components/player/ecosystem/RewardHistoryPanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Reward History | ${BRAND_NAME}`,
};

export default function RewardHistoryPage() {
  return <RewardHistoryPanel />;
}
