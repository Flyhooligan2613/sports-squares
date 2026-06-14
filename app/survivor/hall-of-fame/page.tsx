import SurvivorHallOfFameClient from "@/components/survivor/SurvivorHallOfFameClient";
import { SURVIVOR_X_PUBLIC_NAME } from "@/lib/survivor/config";

export const metadata = {
  title: `Hall of Fame | ${SURVIVOR_X_PUBLIC_NAME}`,
  description: "Permanent Survivor X™ legacy — champions, streaks, and elite seasons on SquareBoards.",
};

export default function SurvivorHallOfFamePage() {
  return <SurvivorHallOfFameClient />;
}
