"use client";

interface RewardsProgressBarProps {
  label: string;
  current: number;
  target: number;
  pct: number;
  suffix?: string;
  accent?: string;
  className?: string;
}

export default function RewardsProgressBar({
  label,
  current,
  target,
  pct,
  suffix,
  accent = "var(--sb-purple, #a855f7)",
  className = "",
}: RewardsProgressBarProps) {
  const ariaValue = Math.min(100, Math.max(0, pct));

  return (
    <div className={className}>
      <div className="flex justify-between items-baseline gap-2 mb-1.5">
        <span className="text-xs font-medium text-white">{label}</span>
        <span className="text-[10px] text-sb-muted tabular-nums">
          {current.toLocaleString()}
          {suffix ? ` ${suffix}` : ""} / {target.toLocaleString()}
        </span>
      </div>
      <div
        className="h-2 rounded-full bg-black/40 overflow-hidden border border-white/10"
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={ariaValue}
      >
        <div
          className="h-full rounded-full rewards-progress-fill"
          style={{
            width: `${ariaValue}%`,
            background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
          }}
        />
      </div>
    </div>
  );
}
