"use client";

import type { ReactNode } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import NextStepCard from "@/components/genesis/NextStepCard";

interface GenesisEmptyStateProps {
  emoji?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  context?: string;
  compact?: boolean;
  children?: ReactNode;
}

export default function GenesisEmptyState({
  emoji,
  title,
  description,
  actionLabel,
  actionHref,
  context,
  compact = false,
  children,
}: GenesisEmptyStateProps) {
  return (
    <LandingGlassCard className={compact ? "p-6 sm:p-8" : "p-8 sm:p-10"}>
      <div className="sb-section-empty sb-section-empty--compact">
        {emoji ? (
          <span className="sb-section-empty-emoji" aria-hidden>
            {emoji}
          </span>
        ) : null}
        <p className="sb-section-empty-title">{title}</p>
        <p className="sb-section-empty-desc">{description}</p>
        {children}
        {actionLabel && actionHref ? (
          <Button href={actionHref} variant="secondary" size="sm" className="mt-4">
            {actionLabel}
          </Button>
        ) : null}
      </div>
      {context ? (
        <div className="mt-6 pt-6 border-t border-white/10">
          <NextStepCard context={context} embedded />
        </div>
      ) : null}
    </LandingGlassCard>
  );
}
