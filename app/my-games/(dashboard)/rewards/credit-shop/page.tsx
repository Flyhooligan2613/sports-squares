import type { Metadata } from "next";
import CreditShopPanel from "@/components/player/ecosystem/CreditShopPanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Credit Shop | My Rewards | ${BRAND_NAME}`,
};

export default function CreditShopPage() {
  return <CreditShopPanel />;
}
