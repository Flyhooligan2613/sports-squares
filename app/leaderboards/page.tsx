import type { Metadata } from "next";
import LeaderboardsCenter from "@/components/leaderboards/LeaderboardsCenter";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Leaderboards | ${BRAND_NAME}`,
  description:
    "Worldwide SquareBoards rankings — all-time winnings, weekly wins, and streak leaders.",
};

export default function LeaderboardsPage() {
  return <LeaderboardsCenter />;
}
