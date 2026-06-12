import type { Metadata } from "next";
import LiveWinnersCenter from "@/components/live-winners/LiveWinnersCenter";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Live Winners | ${BRAND_NAME}`,
  description:
    "Watch real-time winners, automatic payouts, and live game activity on SquareBoards.",
};

export default function LiveWinnersPage() {
  return <LiveWinnersCenter />;
}
