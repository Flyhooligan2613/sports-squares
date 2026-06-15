import PickemLeaderboardsClient from "@/components/pickem/PickemLeaderboardsClient";

export const metadata = {
  title: "Leaderboards | Football Pick'em Royale™",
};

export default function SoccerPredictorLeaderboardsPage() {
  return <PickemLeaderboardsClient sport="soccer" />;
}
