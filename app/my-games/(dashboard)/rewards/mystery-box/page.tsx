import type { Metadata } from "next";
import MysteryBoxPanel from "@/components/player/ecosystem/MysteryBoxPanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Mystery Box | ${BRAND_NAME}`,
};

export default function MysteryBoxPage() {
  return <MysteryBoxPanel />;
}
