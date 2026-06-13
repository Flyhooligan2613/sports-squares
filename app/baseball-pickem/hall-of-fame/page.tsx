import PickemHallOfFameClient from "@/components/pickem/PickemHallOfFameClient";

export const metadata = {
  title: "Hall of Fame | MLB Pick'em",
};

export default function BaseballPickemHallOfFamePage() {
  return <PickemHallOfFameClient sport="mlb" />;
}
