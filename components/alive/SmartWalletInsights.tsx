"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { SmartWalletInsight } from "@/lib/platform/alive/types";
import { ALIVE_BRAND, ALIVE_COPY } from "@/lib/platform/language/aliveLanguage";

interface SmartWalletInsightsProps {
  insights: SmartWalletInsight[];
  loading?: boolean;
  compact?: boolean;
}

export default function SmartWalletInsights({
  insights,
  loading,
  compact = false,
}: SmartWalletInsightsProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="sb-xp-skeleton h-5 w-36" />
        <div className="sb-xp-skeleton h-20 rounded-xl" />
      </div>
    );
  }

  if (insights.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-sb-muted">
          {ALIVE_COPY.walletInsightsTitle}
        </h3>
        {!compact ? (
          <span className="text-[10px] text-sb-muted">{ALIVE_BRAND.squareBank}</span>
        ) : null}
      </div>
      {insights.slice(0, compact ? 2 : 4).map((insight) => (
        <LandingGlassCard
          key={insight.id}
          className="p-4 flex items-start justify-between gap-4 alive-wallet-insight"
        >
          <div>
            <p className="text-white font-medium text-sm">{insight.title}</p>
            <p className="text-xs text-sb-muted mt-1 leading-relaxed">{insight.body}</p>
          </div>
          <Link
            href={insight.ctaHref}
            className="shrink-0 text-xs font-semibold text-sb-glow hover:text-white transition-colors"
          >
            {insight.ctaLabel} →
          </Link>
        </LandingGlassCard>
      ))}
    </div>
  );
}
