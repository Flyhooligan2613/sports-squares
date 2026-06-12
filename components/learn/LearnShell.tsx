import type { ReactNode } from "react";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingGlassCard from "@/components/landing/LandingGlassCard";

interface LearnShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function LearnShell({ title, subtitle, children }: LearnShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppMenuBar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 sb-page-enter">
        <p className="text-sb-glow text-xs font-bold uppercase tracking-[0.22em] mb-3">
          Learn
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sb-muted text-base mb-8 leading-relaxed">{subtitle}</p>
        ) : null}
        <div className="space-y-4">{children}</div>
      </main>
    </div>
  );
}

export function LearnCard({
  title,
  children,
  step,
}: {
  title: string;
  children: ReactNode;
  step?: number;
}) {
  return (
    <LandingGlassCard className="p-5 sm:p-6 learn-card-enter">
      <div className="flex items-start gap-4">
        {step != null ? (
          <span className="learn-step-badge">{step}</span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
          <div className="text-sb-secondary text-sm leading-relaxed space-y-2">{children}</div>
        </div>
      </div>
    </LandingGlassCard>
  );
}
