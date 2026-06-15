import PickemLandingClient from "@/components/pickem/PickemLandingClient";
import { WNBA_PICKEM_ROYALE_PUBLIC_NAME } from "@/lib/wnbaPickem/config";

export const metadata = {
  title: `${WNBA_PICKEM_ROYALE_PUBLIC_NAME} | SquareBoards`,
  description:
    "Predict every WNBA winner each week. Build streaks and compete on SquareBoards WNBA Pick'em Royale™.",
};

export default function WnbaPickemHomePage() {
  return <PickemLandingClient sport="wnba" />;
}
