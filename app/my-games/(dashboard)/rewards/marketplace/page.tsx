import type { Metadata } from "next";
import RewardsMarketplacePanel from "@/components/player/ecosystem/RewardsMarketplacePanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Reward Marketplace | ${BRAND_NAME}`,
};

export default function MarketplacePage() {
  return <RewardsMarketplacePanel />;
}
