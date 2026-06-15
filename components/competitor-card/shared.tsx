"use client";

import type { ReactNode } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import { COMPETITOR_CARD_ANIMATION_MS } from "@/lib/competitorCard/config";
import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import { useCountUp } from "@/lib/motion/useCountUp";

export function SectionCard({
  id,
  title,
  children,
  className = "",
}: {
  id?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className={`cc-section admin-stat-enter ${className}`}
      style={{ animationDuration: `${COMPETITOR_CARD_ANIMATION_MS}ms` }}
    >
      <h2
        id={id ? `${id}-heading` : undefined}
        className="cc-section-title text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <LandingGlassCard className="p-6 animate-pulse" aria-hidden>
      <div className="h-4 w-1/3 rounded bg-white/10 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded bg-white/5 mb-3" style={{ width: `${90 - i * 12}%` }} />
      ))}
    </LandingGlassCard>
  );
}

export function SectionError({ message }: { message?: string }) {
  return (
    <LandingGlassCard className="p-6" role="alert">
      <p className="text-sm text-red-300">{message ?? COMPETITOR_CARD_COPY.errors.sectionFailed}</p>
    </LandingGlassCard>
  );
}

export function SectionEmpty({
  title,
  body,
  emoji,
  actionLabel,
  actionHref,
}: {
  title: string;
  body: string;
  emoji?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <LandingGlassCard className="p-6 sm:p-8">
      <SectionEmptyState
        emoji={emoji}
        title={title}
        description={body}
        actionLabel={actionLabel}
        actionHref={actionHref}
        compact
      />
    </LandingGlassCard>
  );
}

export function AnimatedStatValue({
  value,
  format = "number",
  active = true,
  className = "",
}: {
  value: number;
  format?: "number" | "currency" | "percent";
  active?: boolean;
  className?: string;
}) {
  const animated = useCountUp(value, active, { duration: 900 });
  const display =
    format === "currency"
      ? `$${animated.toLocaleString()}`
      : format === "percent"
        ? `${animated}%`
        : animated.toLocaleString();

  return (
    <span className={`tabular-nums ${className}`} aria-label={display}>
      {display}
    </span>
  );
}

export function formatPercentile(value: number | null): string {
  if (value == null) return "—";
  return `Top ${100 - value}%`;
}
