import type { Metadata } from "next";
import BonusWalletPanel from "@/components/player/ecosystem/BonusWalletPanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `My Credits | ${BRAND_NAME}`,
};

export default function CreditsPage() {
  return <BonusWalletPanel />;
}
