import type { Metadata } from "next";
import TierProgressPanel from "@/components/player/ecosystem/TierProgressPanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Tier Progress | ${BRAND_NAME}`,
};

export default function TierProgressPage() {
  return <TierProgressPanel />;
}
