import PickemLandingClient from "@/components/pickem/PickemLandingClient";

export const metadata = {
  title: "MLB Pick'em | SquareBoards",
  description:
    "Predict every MLB winner each week. Build streaks and compete on SquareBoards MLB Pick'em.",
};

export default function BaseballPickemHomePage() {
  return <PickemLandingClient sport="mlb" />;
}
