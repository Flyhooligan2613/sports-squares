"use client";

import type { OpsHealthStatus } from "@/lib/operations/geo-compliance/types";
import { MOCK_OPS_HEALTH } from "@/lib/operations/geo-compliance/mockHealth";

const STATUS_CLASS: Record<OpsHealthStatus, string> = {
  healthy: "geo-health-healthy",
  degraded: "geo-health-degraded",
  down: "geo-health-down",
};

export default function OpsHealthBar() {
  const hasIssue = MOCK_OPS_HEALTH.some((h) => h.status !== "healthy");

  return (
    <section
      className="geo-health-bar"
      aria-label="Live operation status"
      role="status"
    >
      <div className="geo-health-bar-inner">
        <span className="geo-health-label">
          <span
            className={`geo-health-pulse ${hasIssue ? "geo-health-pulse-warn" : ""}`}
            aria-hidden="true"
          />
          Live Operation Status
        </span>
        <ul className="geo-health-items">
          {MOCK_OPS_HEALTH.map((item) => (
            <li
              key={item.id}
              className={`geo-health-item ${STATUS_CLASS[item.status]}`}
              title={item.message}
            >
              <span className="geo-health-dot" aria-hidden="true" />
              <span className="geo-health-name">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
