"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Scale,
  XCircle,
} from "lucide-react";
import { Badge, Button, GlassPanel } from "@/design-system";
import type { ComplianceAlert, ComplianceAlertSeverity } from "@/lib/operations/geo-operations/types";
import { MOCK_AUDIT_LOG, MOCK_COMPLIANCE_ALERTS } from "@/lib/operations/geo-operations";

const SEVERITY_ICON: Record<ComplianceAlertSeverity, typeof AlertTriangle> = {
  info: CheckCircle2,
  warning: AlertTriangle,
  critical: XCircle,
};

const SEVERITY_BADGE: Record<ComplianceAlertSeverity, "success" | "review" | "disabled"> = {
  info: "success",
  warning: "review",
  critical: "disabled",
};

interface ComplianceAlertsCenterProps {
  filterStateId?: string | null;
}

export default function ComplianceAlertsCenter({
  filterStateId = null,
}: ComplianceAlertsCenterProps) {
  const [actionTaken, setActionTaken] = useState<Record<string, string>>({});

  const alerts = filterStateId
    ? MOCK_COMPLIANCE_ALERTS.filter((a) => a.stateId === filterStateId)
    : MOCK_COMPLIANCE_ALERTS;

  function handleAction(alertId: string, action: string) {
    setActionTaken((prev) => ({ ...prev, [alertId]: action }));
  }

  return (
    <section className="geo-section" aria-labelledby="geo-ops-alerts-heading">
      <header className="geo-section-header">
        <div>
          <h2 id="geo-ops-alerts-heading" className="geo-section-title">
            Compliance Alerts Center
          </h2>
          <p className="geo-section-subtitle">
            TX, CA, FL, NY timeline — admin approval required, no auto state changes
          </p>
        </div>
        <Badge variant="review" label={`${alerts.length} alerts`} />
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

      <GlassPanel padding="md" className="geo-ops-audit">
        <h3 className="geo-audit-title">
          <Clock className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          Audit History
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
      </GlassPanel>
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
          <Badge variant={SEVERITY_BADGE[alert.severity]} label={alert.severity} />
          <time dateTime={alert.date}>{new Date(alert.date).toLocaleDateString()}</time>
          <span className="geo-alert-source">{alert.source}</span>
        </div>
        <h4 className="geo-alert-title">{alert.title}</h4>
        <p className="geo-alert-desc">{alert.description}</p>
        <p className="geo-alert-rec">
          <Scale className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
          {alert.recommendedAction}
        </p>
        <div className="geo-alert-actions">
          {(["Review", "Dismiss", "Mark Complete", "Export"] as const).map((action) => (
            <Button
              key={action}
              variant={actionTaken === action ? "primary" : "glass"}
              size="sm"
              onClick={() => onAction(alert.id, action)}
            >
              {action === "Export" && (
                <Download className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
              )}
              {action}
            </Button>
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
