import type { Metadata } from "next";
import GiftShopPanel from "@/components/player/ecosystem/GiftShopPanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Gift Shop | My Rewards | ${BRAND_NAME}`,
};

export default function GiftShopPage() {
  return <GiftShopPanel />;
}
