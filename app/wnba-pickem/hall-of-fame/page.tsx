import PickemHallOfFameClient from "@/components/pickem/PickemHallOfFameClient";

export const metadata = {
  title: "Hall of Fame | WNBA Pick'em Royale™",
};

export default function WnbaPickemHallOfFamePage() {
  return <PickemHallOfFameClient sport="wnba" />;
}
