import PickemLandingClient from "@/components/pickem/PickemLandingClient";
import { FOOTBALL_PICKEM_ROYALE_PUBLIC_NAME } from "@/lib/soccerPickem/config";

export const metadata = {
  title: `${FOOTBALL_PICKEM_ROYALE_PUBLIC_NAME} | SquareBoards`,
  description:
    "Predict every MLS winner each matchweek. Build streaks, earn legacy, and compete on SquareBoards Football Pick'em Royale™.",
};

export default function SoccerPredictorHomePage() {
  return <PickemLandingClient sport="soccer" />;
}
