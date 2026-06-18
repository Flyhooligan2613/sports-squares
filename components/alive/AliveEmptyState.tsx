"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import {
  buildEmptyStateIntelligence,
  type AliveEmptyContext,
} from "@/lib/platform/alive/emptyStateIntelligence";

interface AliveEmptyStateProps {
  context: AliveEmptyContext;
  title?: string;
  body?: string;
  emoji?: string;
}

export default function AliveEmptyState({
  context,
  title,
  body,
  emoji = "✨",
}: AliveEmptyStateProps) {
  const payload = buildEmptyStateIntelligence(context, { title, body });

  return (
    <LandingGlassCard className="alive-empty-state p-8 sm:p-10 text-center" glow>
      <p className="text-5xl mb-4 alive-empty-float" aria-hidden>
        {emoji}
      </p>
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{payload.title}</h2>
      <p className="text-sb-muted max-w-md mx-auto mb-8 leading-relaxed">{payload.body}</p>

      <div className="grid sm:grid-cols-3 gap-3 text-left max-w-3xl mx-auto">
        {payload.steps.map((step) => (
          <Link
            key={step.id}
            href={step.ctaHref}
            className="alive-empty-step rounded-xl border border-white/8 bg-white/[0.03] p-4 hover:border-sb-glow/30 hover:bg-white/[0.05] transition-colors"
          >
            <span className="text-2xl mb-2 block" aria-hidden>
              {step.emoji}
            </span>
            <p className="text-sm font-semibold text-white mb-1">{step.title}</p>
            <p className="text-xs text-sb-muted leading-relaxed mb-3">{step.body}</p>
            <span className="text-xs font-semibold text-sb-glow">{step.ctaLabel} →</span>
          </Link>
        ))}
      </div>

      {payload.steps[0] ? (
        <div className="mt-8">
          <Button href={payload.steps[0].ctaHref} variant="primary">
            {payload.steps[0].ctaLabel}
          </Button>
        </div>
      ) : null}
    </LandingGlassCard>
  );
}
