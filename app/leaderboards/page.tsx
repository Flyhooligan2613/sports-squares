import type { Metadata } from "next";
import LeaderboardsCenter from "@/components/leaderboards/LeaderboardsCenter";
import { BRAND_NAME } from "@/lib/brand";
import { COMMUNITY_LABELS } from "@/lib/platform/language";

export const metadata: Metadata = {
  title: `${COMMUNITY_LABELS.competitionRankings} | ${BRAND_NAME}`,
  description:
    "Worldwide SquareBoards competition rankings — all-time winnings, weekly wins, and streak leaders.",
};

export default function LeaderboardsPage() {
  return <LeaderboardsCenter />;
}
