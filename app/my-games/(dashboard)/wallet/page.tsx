import type { Metadata } from "next";
import { SquareWalletDashboard } from "@/components/square-wallet";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `SquareWallet™ | ${BRAND_NAME}`,
  description: "Your premium financial hub — fund contests, track winnings, manage cash-out.",
};

export default function WalletPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <SquareWalletDashboard />
    </div>
  );
}
