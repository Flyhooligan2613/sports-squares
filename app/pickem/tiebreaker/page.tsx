"use client";

import { Suspense } from "react";
import PickemTiebreakerClient from "@/components/pickem/PickemTiebreakerClient";

export default function PickemTiebreakerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sb-muted">
          Loading tiebreaker…
        </div>
      }
    >
      <PickemTiebreakerClient />
    </Suspense>
  );
}
