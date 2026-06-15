import { Suspense } from "react";
import SurvivorLeaguesClient from "@/components/survivor/SurvivorLeaguesClient";
import { SURVIVOR_X_PUBLIC_NAME } from "@/lib/survivor/config";

export const metadata = {
  title: `Leagues | ${SURVIVOR_X_PUBLIC_NAME}`,
  description: "Browse Global and Private Survivor X™ leagues on SquareBoards.",
};

export default function SurvivorLeaguesPage() {
  return (
    <Suspense fallback={null}>
      <SurvivorLeaguesClient />
    </Suspense>
  );
}
