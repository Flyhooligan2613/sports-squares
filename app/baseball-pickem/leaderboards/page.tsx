import PickemLeaderboardsClient from "@/components/pickem/PickemLeaderboardsClient";

export const metadata = {
  title: "Leaderboards | MLB Pick'em",
};

export default function BaseballPickemLeaderboardsPage() {
  return <PickemLeaderboardsClient sport="mlb" />;
}
