import type { LucideIcon } from "lucide-react";

type Accent = "purple" | "success" | "gold" | "muted";

interface KpiCardProps {
  label: string;
  value: string | number;
  accent?: Accent;
  icon?: LucideIcon;
  className?: string;
  delay?: number;
}

const ACCENT_STYLES: Record<Accent, { value: string; icon: string }> = {
  purple: {
    value: "text-sb-glow",
    icon: "bg-sb-purple/15 text-sb-glow border-sb-purple/25",
  },
  success: {
    value: "text-sb-success",
    icon: "bg-sb-success/10 text-sb-success border-sb-success/25",
  },
  gold: {
    value: "text-sb-gold",
    icon: "bg-sb-gold/10 text-sb-gold border-sb-gold/25",
  },
  muted: {
    value: "text-white",
    icon: "bg-white/5 text-sb-muted border-white/10",
  },
};

export default function KpiCard({
  label,
  value,
  accent = "purple",
  icon: Icon,
  className = "",
  delay = 0,
}: KpiCardProps) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div
      className={`sb-kpi-card admin-stat-enter ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${styles.value}`}>
            {value}
          </p>
          <p className="text-sb-muted text-xs sm:text-sm mt-1.5 font-medium uppercase tracking-wider">
            {label}
          </p>
        </div>
        {Icon && (
          <span
            className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${styles.icon}`}
          >
            <Icon className="w-5 h-5" strokeWidth={1.75} />
          </span>
        )}
      </div>
    </div>
  );
}
