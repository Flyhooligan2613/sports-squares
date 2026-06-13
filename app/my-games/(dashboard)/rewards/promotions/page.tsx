import type { Metadata } from "next";
import PromotionsPanel from "@/components/player/ecosystem/PromotionsPanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Promotions | ${BRAND_NAME}`,
};

export default function PromotionsPage() {
  return <PromotionsPanel />;
}
