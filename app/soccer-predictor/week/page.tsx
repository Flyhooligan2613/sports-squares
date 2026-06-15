import PickemWeekClient from "@/components/pickem/PickemWeekClient";
import { getLoadingMessageAt } from "@/lib/platform/language";
import { Suspense } from "react";

export const metadata = {
  title: "Matchweek Picks | Football Pick'em Royale™",
  description: "Make your MLS predictions for this matchweek.",
};

export default function SoccerPredictorWeekPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sb-muted">
          {getLoadingMessageAt("pickem", 0)}
        </div>
      }
    >
      <PickemWeekClient sport="soccer" />
    </Suspense>
  );
}
