import type { Metadata } from "next";
import InventoryPanel from "@/components/player/ecosystem/InventoryPanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Inventory | ${BRAND_NAME}`,
};

export default function InventoryPage() {
  return <InventoryPanel />;
}
