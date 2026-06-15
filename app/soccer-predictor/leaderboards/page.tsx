import PickemLeaderboardsClient from "@/components/pickem/PickemLeaderboardsClient";
import { COMMUNITY_LABELS } from "@/lib/platform/language";

export const metadata = {
  title: `${COMMUNITY_LABELS.competitionRankings} | Football Pick'em Royale™`,
  description: "Weekly, season, and all-time football Pick'em competition rankings.",
};

export default function SoccerPredictorLeaderboardsPage() {
  return <PickemLeaderboardsClient sport="soccer" />;
}
