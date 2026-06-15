import PickemWeekClient from "@/components/pickem/PickemWeekClient";
import { getLoadingMessageAt } from "@/lib/platform/language";
import { Suspense } from "react";

export const metadata = {
  title: "Weekly Picks | MLB Pick'em",
  description: "Make your MLB Pick'em selections for this week.",
};

export default function BaseballPickemWeekPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sb-muted">
          {getLoadingMessageAt("pickem", 0)}
        </div>
      }
    >
      <PickemWeekClient sport="mlb" />
    </Suspense>
  );
}
