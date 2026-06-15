import PickemLeaderboardsClient from "@/components/pickem/PickemLeaderboardsClient";
import { COMMUNITY_LABELS } from "@/lib/platform/language";

export const metadata = {
  title: `${COMMUNITY_LABELS.competitionRankings} | WNBA Pick'em Royale™`,
  description: "Weekly, season, and all-time WNBA Pick'em competition rankings.",
};

export default function WnbaPickemLeaderboardsPage() {
  return <PickemLeaderboardsClient sport="wnba" />;
}
