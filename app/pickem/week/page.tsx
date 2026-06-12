import PickemWeekClient from "@/components/pickem/PickemWeekClient";
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
          Loading…
        </div>
      }
    >
      <PickemWeekClient />
    </Suspense>
  );
}
