"use client";

import { TRUST_MESSAGES } from "@/lib/platform/core/trustMessages";

export default function PlatformTrustStrip({ className = "" }: { className?: string }) {
  const items = [
    TRUST_MESSAGES.officialScores,
    TRUST_MESSAGES.stripePayouts,
    TRUST_MESSAGES.fullyAutomated,
    TRUST_MESSAGES.guaranteedPlay,
  ];

  return (
    <div
      className={`flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-sb-muted ${className}`}
      role="note"
      aria-label="Platform trust guarantees"
    >
      {items.map((text) => (
        <span key={text} className="inline-flex items-center gap-1.5">
          <span className="text-emerald-400/80" aria-hidden="true">
            ✓
          </span>
          {text}
        </span>
      ))}
    </div>
  );
}
