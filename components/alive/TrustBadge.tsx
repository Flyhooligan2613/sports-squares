"use client";

import { ALIVE_BRAND, ALIVE_COPY } from "@/lib/platform/language/aliveLanguage";

export default function TrustBadge({ className = "" }: { className?: string }) {
  const badges = [
    { label: ALIVE_BRAND.trustSecure, emoji: "🔒" },
    { label: ALIVE_BRAND.trustVerified, emoji: "✓" },
    { label: ALIVE_BRAND.trustCommunity, emoji: "👥" },
  ];

  return (
    <div
      className={["alive-trust-badge flex flex-wrap items-center gap-2", className].join(" ")}
      aria-label={ALIVE_COPY.trustBadgeAria}
    >
      {badges.map((badge) => (
        <span
          key={badge.label}
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-sb-muted/80 px-2.5 py-1 rounded-full border border-white/8 bg-white/[0.02]"
        >
          <span aria-hidden>{badge.emoji}</span>
          {badge.label}
        </span>
      ))}
    </div>
  );
}
