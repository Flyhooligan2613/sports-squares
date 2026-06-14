import SurvivorWeekClient from "@/components/survivor/SurvivorWeekClient";
import { SURVIVOR_X_PUBLIC_NAME } from "@/lib/survivor/config";

export const metadata = {
  title: `Play This Week | ${SURVIVOR_X_PUBLIC_NAME}`,
  description: "Lock your weekly NFL Survivor pick on SquareBoards Survivor X™.",
};

export default function SurvivorWeekPage() {
  return <SurvivorWeekClient />;
}
