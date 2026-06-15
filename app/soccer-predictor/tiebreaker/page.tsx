import PickemTiebreakerClient from "@/components/pickem/PickemTiebreakerClient";
import { Suspense } from "react";

export const metadata = {
  title: "Championship Tiebreaker | Football Pick'em Royale™",
};

export default function SoccerPredictorTiebreakerPage() {
  return (
    <Suspense fallback={null}>
      <PickemTiebreakerClient sport="soccer" />
    </Suspense>
  );
}
