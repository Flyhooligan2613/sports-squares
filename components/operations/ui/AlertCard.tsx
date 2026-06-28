import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { OpsAlert } from "@/lib/operations/types";

interface AlertCardProps {
  alert: OpsAlert;
  className?: string;
}

const SEVERITY_CONFIG = {
  info: {
    icon: Info,
    className: "ops-alert-info",
    badge: "ops-badge-blue",
  },
  warning: {
    icon: AlertTriangle,
    className: "ops-alert-warning",
    badge: "ops-badge-warning",
  },
  critical: {
    icon: AlertCircle,
    className: "ops-alert-critical",
    badge: "ops-badge-danger",
  },
};

export default function AlertCard({ alert, className = "" }: AlertCardProps) {
  const config = SEVERITY_CONFIG[alert.severity];
  const Icon = config.icon;

  return (
    <article
      className={`ops-glass-card ops-alert-card ${config.className} ${className}`}
      role="status"
    >
      <div className="ops-alert-card-inner">
        <span className="ops-alert-icon" aria-hidden="true">
          <Icon className="w-4 h-4" strokeWidth={2} />
        </span>
        <div className="ops-alert-content">
          <div className="ops-alert-header">
            <h4 className="ops-alert-title">{alert.title}</h4>
            <span className={`ops-badge ${config.badge}`}>{alert.severity}</span>
          </div>
          <p className="ops-alert-message">{alert.message}</p>
          <div className="ops-alert-footer">
            <span>{alert.source}</span>
            <span>{alert.timestamp}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
