"use client";

import { Suspense } from "react";
import PurchaseSuccessContent from "./PurchaseSuccessContent";

export default function PurchaseSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="purchase-success-page min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
          <p className="text-sb-muted text-sm">Confirming your purchase…</p>
        </main>
      }
    >
      <PurchaseSuccessContent />
    </Suspense>
  );
}
