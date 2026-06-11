"use client";

import { Suspense } from "react";
import PurchaseSuccessContent from "./PurchaseSuccessContent";

export default function PurchaseSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
          <p className="text-slate-500 text-sm">Loading purchase status...</p>
        </main>
      }
    >
      <PurchaseSuccessContent />
    </Suspense>
  );
}
