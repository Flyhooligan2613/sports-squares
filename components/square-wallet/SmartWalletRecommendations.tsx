"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { SmartWalletRecommendation } from "@/lib/platform/engines/payment/wallet";

interface SmartWalletRecommendationsProps {
  recommendations: SmartWalletRecommendation[];
}

export default function SmartWalletRecommendations({
  recommendations,
}: SmartWalletRecommendationsProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-sb-muted">
        Smart Wallet
      </h3>
      {recommendations.slice(0, 3).map((rec) => (
        <LandingGlassCard key={rec.id} className="p-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-white font-medium text-sm">{rec.title}</p>
            <p className="text-xs text-sb-muted mt-1 leading-relaxed">{rec.body}</p>
          </div>
          <Link
            href={rec.ctaHref}
            className="shrink-0 text-xs font-semibold text-sb-glow hover:text-white transition-colors"
          >
            {rec.ctaLabel} →
          </Link>
        </LandingGlassCard>
      ))}
    </div>
  );
}
