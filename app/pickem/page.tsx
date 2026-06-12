import PickemLandingClient from "@/components/pickem/PickemLandingClient";

export const metadata = {
  title: "Pick'em | SquareBoards",
  description:
    "Predict every NFL winner each week. Build streaks and compete on SquareBoards Pick'em.",
};

export default function PickemHomePage() {
  return <PickemLandingClient />;
}
