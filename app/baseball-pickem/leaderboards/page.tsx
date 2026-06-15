import PickemLeaderboardsClient from "@/components/pickem/PickemLeaderboardsClient";
import { COMMUNITY_LABELS } from "@/lib/platform/language";

export const metadata = {
  title: `${COMMUNITY_LABELS.competitionRankings} | MLB Pick'em`,
  description: "Weekly, season, and all-time MLB Pick'em competition rankings.",
};

export default function BaseballPickemLeaderboardsPage() {
  return <PickemLeaderboardsClient sport="mlb" />;
}
