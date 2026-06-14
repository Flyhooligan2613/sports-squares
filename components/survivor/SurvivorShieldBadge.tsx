"use client";

interface SurvivorShieldBadgeProps {
  available: boolean;
  usedWeek: number | null;
  compact?: boolean;
  className?: string;
}

export default function SurvivorShieldBadge({
  available,
  usedWeek,
  compact = false,
  className = "",
}: SurvivorShieldBadgeProps) {
  const statusLabel = available ? "Available" : usedWeek ? `Used Week ${usedWeek}` : "Consumed";

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold ${
          available ? "text-violet-300" : "text-sb-muted"
        } ${className}`}
        title={`Survivor Shield: ${statusLabel}`}
      >
        <span aria-hidden>🛡️</span>
        {available ? "Shield ready" : "Shield used"}
      </span>
    );
  }

  return (
    <div
      className={`survivor-shield-badge rounded-xl border px-3 py-2.5 text-center ${
        available
          ? "border-violet-400/35 bg-violet-500/10 survivor-shield-badge-ready"
          : "border-white/10 bg-white/[0.03]"
      } ${className}`}
    >
      <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">
        Survivor Shield
      </p>
      <p className="text-lg" aria-hidden>
        🛡️
      </p>
      <p
        className={`text-xs font-bold mt-1 ${
          available ? "text-violet-200" : "text-sb-muted"
        }`}
      >
        {statusLabel}
      </p>
    </div>
  );
}
