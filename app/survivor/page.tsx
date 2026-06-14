import SurvivorLandingClient from "@/components/survivor/SurvivorLandingClient";
import { SURVIVOR_X_PUBLIC_NAME } from "@/lib/survivor/config";

export const metadata = {
  title: `${SURVIVOR_X_PUBLIC_NAME} | SquareBoards`,
  description:
    "Survive the NFL season one pick at a time. Survivor X™ — strategy, legacy, and community on SquareBoards.",
};

export default function SurvivorHomePage() {
  return <SurvivorLandingClient />;
}
