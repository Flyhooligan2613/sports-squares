import PickemHallOfFameClient from "@/components/pickem/PickemHallOfFameClient";

export const metadata = {
  title: "Hall of Fame | Football Pick'em Royale™",
};

export default function SoccerPredictorHallOfFamePage() {
  return <PickemHallOfFameClient sport="soccer" />;
}
