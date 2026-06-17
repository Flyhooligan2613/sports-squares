import type { Metadata } from "next";
import InventoryPanel from "@/components/player/ecosystem/InventoryPanel";
import { BRAND_NAME } from "@/lib/brand";
import { MY_REWARDS_NAME, MY_TROPHIES_NAME } from "@/lib/platform/ecosystem/squareDropBrand";

export const metadata: Metadata = {
  title: `${MY_TROPHIES_NAME} | ${MY_REWARDS_NAME} | ${BRAND_NAME}`,
};

export default function InventoryPage() {
  return <InventoryPanel />;
}
