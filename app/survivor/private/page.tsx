import { Suspense } from "react";
import SurvivorPrivateClient from "@/components/survivor/SurvivorPrivateClient";
import { SURVIVOR_X_PUBLIC_NAME } from "@/lib/survivor/config";

export const metadata = {
  title: `Private Leagues | ${SURVIVOR_X_PUBLIC_NAME}`,
  description: "Create or join a private Survivor X™ league with friends on SquareBoards.",
};

export default function SurvivorPrivatePage() {
  return (
    <Suspense fallback={null}>
      <SurvivorPrivateClient />
    </Suspense>
  );
}
