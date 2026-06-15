import PickemWeekClient from "@/components/pickem/PickemWeekClient";
import { getLoadingMessageAt } from "@/lib/platform/language";
import { Suspense } from "react";

export const metadata = {
  title: "Weekly Picks | WNBA Pick'em Royale™",
  description: "Make your WNBA Pick'em Royale™ selections for this week.",
};

export default function WnbaPickemWeekPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sb-muted">
          {getLoadingMessageAt("pickem", 0)}
        </div>
      }
    >
      <PickemWeekClient sport="wnba" />
    </Suspense>
  );
}
