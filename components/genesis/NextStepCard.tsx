"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { GenesisNextStep } from "@/lib/platform/engines/genesis";

interface NextStepCardProps {
  context: string;
  embedded?: boolean;
}

export default function NextStepCard({ context, embedded = false }: NextStepCardProps) {
  const [step, setStep] = useState<GenesisNextStep | null>(null);

  useEffect(() => {
    void fetch(`/api/genesis/next-step?context=${encodeURIComponent(context)}`, {
      cache: "no-store",
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setStep(json?.nextStep ?? null))
      .catch(() => undefined);
  }, [context]);

  if (!step) return null;

  const body = (
    <div className="flex items-start gap-3">
      <span className="text-2xl shrink-0" aria-hidden>
        {step.emoji}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-sb-glow mb-1">Suggested Next Step</p>
        <p className="font-semibold text-white">{step.title}</p>
        <p className="text-sm text-sb-muted mt-1">{step.body}</p>
        <Link
          href={step.ctaHref}
          className="inline-flex mt-3 text-sm text-sb-glow hover:underline font-medium"
        >
          {step.ctaLabel} →
        </Link>
      </div>
    </div>
  );

  if (embedded) return body;

  return <LandingGlassCard className="p-5 sm:p-6">{body}</LandingGlassCard>;
}
