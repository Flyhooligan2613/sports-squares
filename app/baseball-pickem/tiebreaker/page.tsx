import PickemTiebreakerClient from "@/components/pickem/PickemTiebreakerClient";
import { Suspense } from "react";

export const metadata = {
  title: "Tiebreaker | MLB Pick'em",
};

export default function BaseballPickemTiebreakerPage() {
  return (
    <Suspense fallback={null}>
      <PickemTiebreakerClient sport="mlb" />
    </Suspense>
  );
}
