import PickemWeekClient from "@/components/pickem/PickemWeekClient";
import { getLoadingMessageAt } from "@/lib/platform/language";
import { Suspense } from "react";

export const metadata = {
  title: "Weekly Picks | SquareBoards Pick'em",
  description: "Make your NFL Pick'em selections for this week.",
};

export default function PickemWeekPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sb-muted">
          {getLoadingMessageAt("pickem", 0)}
        </div>
      }
    >
      <PickemWeekClient />
    </Suspense>
  );
}
