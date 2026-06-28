import type { LucideIcon } from "lucide-react";
import type { OpsAccent } from "@/lib/operations/types";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  accent?: OpsAccent;
  icon?: LucideIcon;
  delay?: number;
  className?: string;
}

const ACCENT_CLASS: Record<OpsAccent, { value: string; icon: string; glow: string }> = {
  blue: {
    value: "ops-stat-value-blue",
    icon: "ops-stat-icon-blue",
    glow: "ops-stat-glow-blue",
  },
  purple: {
    value: "ops-stat-value-purple",
    icon: "ops-stat-icon-purple",
    glow: "ops-stat-glow-purple",
  },
  success: {
    value: "ops-stat-value-success",
    icon: "ops-stat-icon-success",
    glow: "ops-stat-glow-success",
  },
  gold: {
    value: "ops-stat-value-gold",
    icon: "ops-stat-icon-gold",
    glow: "ops-stat-glow-gold",
  },
  warning: {
    value: "ops-stat-value-warning",
    icon: "ops-stat-icon-warning",
    glow: "ops-stat-glow-warning",
  },
  danger: {
    value: "ops-stat-value-danger",
    icon: "ops-stat-icon-danger",
    glow: "ops-stat-glow-danger",
  },
  muted: {
    value: "ops-stat-value-muted",
    icon: "ops-stat-icon-muted",
    glow: "",
  },
};

const TREND_CLASS = {
  up: "ops-trend-up",
  down: "ops-trend-down",
  neutral: "ops-trend-neutral",
};

export default function StatCard({
  label,
  value,
  change,
  trend = "neutral",
  accent = "purple",
  icon: Icon,
  delay = 0,
  className = "",
}: StatCardProps) {
  const styles = ACCENT_CLASS[accent];

  return (
    <article
      className={`ops-glass-card ops-stat-card ${styles.glow} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
      aria-label={`${label}: ${value}`}
    >
      <div className="ops-stat-card-inner">
        <div className="ops-stat-card-content">
          <p className={`ops-stat-value ${styles.value}`}>{value}</p>
          <p className="ops-stat-label">{label}</p>
          {change && (
            <p className={`ops-stat-change ${TREND_CLASS[trend]}`}>{change}</p>
          )}
        </div>
        {Icon && (
          <span className={`ops-stat-icon ${styles.icon}`} aria-hidden="true">
            <Icon className="w-5 h-5" strokeWidth={1.75} />
          </span>
        )}
      </div>
    </article>
  );
}
