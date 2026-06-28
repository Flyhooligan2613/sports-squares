"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Scale,
  XCircle,
} from "lucide-react";
import type { ComplianceAlert, ComplianceAlertSeverity } from "@/lib/operations/geo-compliance/types";
import {
  MOCK_AUDIT_LOG,
  MOCK_COMPLIANCE_ALERTS,
} from "@/lib/operations/geo-compliance/mockAlerts";

const SEVERITY_ICON: Record<ComplianceAlertSeverity, typeof AlertTriangle> = {
  info: CheckCircle2,
  warning: AlertTriangle,
  critical: XCircle,
};

interface ComplianceAlertTimelineProps {
  filterStateId?: string | null;
}

export default function ComplianceAlertTimeline({
  filterStateId = null,
}: ComplianceAlertTimelineProps) {
  const [actionTaken, setActionTaken] = useState<Record<string, string>>({});

  const alerts = filterStateId
    ? MOCK_COMPLIANCE_ALERTS.filter((a) => a.stateId === filterStateId)
    : MOCK_COMPLIANCE_ALERTS;

  function handleAction(alertId: string, action: string) {
    setActionTaken((prev) => ({ ...prev, [alertId]: action }));
  }

  return (
    <section className="geo-section" aria-labelledby="geo-alerts-heading">
      <header className="geo-section-header">
        <div>
          <h2 id="geo-alerts-heading" className="geo-section-title">
            Compliance Alert Center
          </h2>
          <p className="geo-section-subtitle">
            Live timeline — actions are UI-only, admin approval required
          </p>
        </div>
        <span className="ops-badge ops-badge-warning">{alerts.length} alerts</span>
      </header>

      <div className="geo-alert-timeline">
        {alerts.map((alert, i) => (
          <AlertTimelineItem
            key={alert.id}
            alert={alert}
            delay={i * 60}
            actionTaken={actionTaken[alert.id]}
            onAction={handleAction}
          />
        ))}
      </div>

      <div className="geo-audit-log">
        <h3 className="geo-audit-title">
          <Clock className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          Permanent Audit Log
        </h3>
        <ul className="geo-audit-list">
          {MOCK_AUDIT_LOG.map((entry) => (
            <li key={entry.id} className="geo-audit-entry">
              <time className="geo-audit-time" dateTime={entry.timestamp}>
                {new Date(entry.timestamp).toLocaleString()}
              </time>
              <span className="geo-audit-actor">{entry.actor}</span>
              <span className="geo-audit-action">{entry.action}</span>
              <span className="geo-audit-state">{entry.stateId}</span>
              <span className="geo-audit-details">{entry.details}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function AlertTimelineItem({
  alert,
  delay,
  actionTaken,
  onAction,
}: {
  alert: ComplianceAlert;
  delay: number;
  actionTaken?: string;
  onAction: (id: string, action: string) => void;
}) {
  const Icon = SEVERITY_ICON[alert.severity];

  return (
    <article
      className={`geo-alert-item geo-alert-${alert.severity}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="geo-alert-marker" aria-hidden="true">
        <Icon className="w-4 h-4" strokeWidth={1.75} />
      </div>
      <div className="geo-alert-body">
        <div className="geo-alert-meta">
          <span className="geo-alert-state">{alert.stateName}</span>
          <time dateTime={alert.date}>{new Date(alert.date).toLocaleDateString()}</time>
          <span className="geo-alert-source">{alert.source}</span>
          <span className={`geo-alert-status geo-alert-status-${alert.status}`}>
            {alert.status.replace(/_/g, " ")}
          </span>
        </div>
        <h4 className="geo-alert-title">{alert.title}</h4>
        <p className="geo-alert-desc">{alert.description}</p>
        <p className="geo-alert-rec">
          <Scale className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
          {alert.recommendedAction}
        </p>
        <div className="geo-alert-actions">
          {(["Approve", "Reject", "Needs Legal Review", "Resolved"] as const).map((action) => (
            <button
              key={action}
              type="button"
              className={`geo-alert-action-btn ${actionTaken === action ? "geo-alert-action-active" : ""}`}
              onClick={() => onAction(alert.id, action)}
            >
              {action}
            </button>
          ))}
        </div>
        {actionTaken && (
          <p className="geo-alert-action-note" role="status">
            Recorded: {actionTaken} (mock — no state change)
          </p>
        )}
      </div>
    </article>
  );
}
