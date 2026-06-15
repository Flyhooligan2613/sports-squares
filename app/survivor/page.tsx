import { Suspense } from "react";
import SurvivorLandingClient from "@/components/survivor/SurvivorLandingClient";
import { SURVIVOR_X_PUBLIC_NAME } from "@/lib/survivor/config";

export const metadata = {
  title: `${SURVIVOR_X_PUBLIC_NAME} | SquareBoards`,
  description:
    "Survive the season one pick at a time. NFL and MLB Survivor X™ — strategy, legacy, and community on SquareBoards.",
};

export default function SurvivorHomePage() {
  return (
    <Suspense fallback={null}>
      <SurvivorLandingClient />
    </Suspense>
  );
}
