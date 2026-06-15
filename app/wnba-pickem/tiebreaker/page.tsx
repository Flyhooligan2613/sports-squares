import PickemTiebreakerClient from "@/components/pickem/PickemTiebreakerClient";
import { Suspense } from "react";

export const metadata = {
  title: "Tiebreaker | WNBA Pick'em Royale™",
};

export default function WnbaPickemTiebreakerPage() {
  return (
    <Suspense fallback={null}>
      <PickemTiebreakerClient sport="wnba" />
    </Suspense>
  );
}
