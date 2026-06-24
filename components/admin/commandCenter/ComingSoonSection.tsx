import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Clock, Sparkles } from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";

export interface ComingSoonCapability {
  label: string;
  status: "live" | "planned";
}

export interface ComingSoonLink {
  href: string;
  label: string;
}

interface ComingSoonSectionProps {
  title: string;
  description: string;
  capabilities: ComingSoonCapability[];
  relatedLinks?: ComingSoonLink[];
  icon?: LucideIcon;
  children?: React.ReactNode;
}

export default function ComingSoonSection({
  title,
  description,
  capabilities,
  relatedLinks = [],
  icon: Icon = Sparkles,
  children,
}: ComingSoonSectionProps) {
  const liveCount = capabilities.filter((c) => c.status === "live").length;
  const plannedCount = capabilities.filter((c) => c.status === "planned").length;

  return (
    <div className="space-y-4">
      <LandingGlassCard className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/25 bg-purple-500/10 px-3 py-1">
              <Clock className="w-3.5 h-3.5 text-purple-300" strokeWidth={2} aria-hidden />
              <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-purple-200">
                Rolling out
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <Icon className="w-5 h-5 text-sb-glow" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-white">{title}</h2>
                <p className="text-sm text-sb-muted mt-1 max-w-2xl">{description}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 text-center shrink-0">
            <StatPill label="Live" value={liveCount} accent="success" />
            <StatPill label="Planned" value={plannedCount} accent="muted" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {capabilities.map((cap) => (
            <div
              key={cap.label}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3"
            >
              <p className="text-sm font-medium text-white">{cap.label}</p>
              <p
                className={[
                  "text-[10px] uppercase tracking-wider font-semibold mt-1.5",
                  cap.status === "live" ? "text-emerald-400" : "text-sb-muted",
                ].join(" ")}
              >
                {cap.status === "live" ? "Available" : "Coming soon"}
              </p>
            </div>
          ))}
        </div>

        {relatedLinks.length > 0 ? (
          <div className="flex flex-wrap gap-3 pt-1">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center text-sm font-medium text-sb-glow hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-glow/40 rounded-md px-1"
              >
                {link.label} →
              </Link>
            ))}
          </div>
        ) : null}
      </LandingGlassCard>

      {children}
    </div>
  );
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "success" | "muted";
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 min-w-[5rem]">
      <p
        className={[
          "text-xl font-bold tabular-nums",
          accent === "success" ? "text-emerald-400" : "text-white/70",
        ].join(" ")}
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-sb-muted">{label}</p>
    </div>
  );
}
