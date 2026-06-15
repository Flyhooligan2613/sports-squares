import PickemLeaderboardsClient from "@/components/pickem/PickemLeaderboardsClient";
import { COMMUNITY_LABELS } from "@/lib/platform/language";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `${COMMUNITY_LABELS.competitionRankings} | ${BRAND_NAME} Pick'em`,
  description: "Weekly, season, and all-time Pick'em competition rankings.",
};

export default function PickemLeaderboardsPage() {
  return <PickemLeaderboardsClient />;
}
