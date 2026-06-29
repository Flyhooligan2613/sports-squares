"use client";

import { Bell, Calendar, Mail, TrendingUp, Users } from "lucide-react";
import { Badge, GlassPanel } from "@/design-system";
import type { GeoOperationsState } from "@/lib/operations/geo-operations/types";

interface WaitlistPanelProps {
  state: GeoOperationsState | null;
}

export default function WaitlistPanel({ state }: WaitlistPanelProps) {
  if (!state?.waitlist) return null;
  if (state.status === "live") return null;

  const wl = state.waitlist;
  const emailEnabled = wl.notificationCount > 0;

  return (
    <GlassPanel glow="purple" className="geo-ops-waitlist" padding="md">
      <header className="geo-ops-panel-header">
        <div>
          <h3 className="geo-ops-panel-title">Waitlist — {state.name}</h3>
          <p className="geo-ops-panel-subtitle">
            Unavailable jurisdiction — limited features allowed
          </p>
        </div>
        <Badge variant="coming-soon" label="Waitlist" />
      </header>

      <div className="geo-ops-stat-grid">
        <div className="geo-ops-stat">
          <Users className="geo-ops-stat-icon" strokeWidth={1.75} aria-hidden="true" />
          <span className="geo-ops-stat-value">{wl.currentWaitlist.toLocaleString()}</span>
          <span className="geo-ops-stat-label">People Waiting</span>
        </div>
        <div className="geo-ops-stat">
          <Calendar className="geo-ops-stat-icon" strokeWidth={1.75} aria-hidden="true" />
          <span className="geo-ops-stat-value">{wl.projectedLaunch}</span>
          <span className="geo-ops-stat-label">Projected Launch</span>
        </div>
        <div className="geo-ops-stat">
          <Mail className="geo-ops-stat-icon" strokeWidth={1.75} aria-hidden="true" />
          <span className="geo-ops-stat-value">{emailEnabled ? "On" : "Off"}</span>
          <span className="geo-ops-stat-label">Email Notifications</span>
        </div>
        <div className="geo-ops-stat">
          <TrendingUp className="geo-ops-stat-icon" strokeWidth={1.75} aria-hidden="true" />
          <span className="geo-ops-stat-value">{wl.interestScore}</span>
          <span className="geo-ops-stat-label">Interest Trend</span>
        </div>
        <div className="geo-ops-stat">
          <Bell className="geo-ops-stat-icon" strokeWidth={1.75} aria-hidden="true" />
          <span className="geo-ops-stat-value">{wl.notificationCount.toLocaleString()}</span>
          <span className="geo-ops-stat-label">Notifications Sent</span>
        </div>
      </div>

      <div className="geo-ops-waitlist-features">
        <h4 className="geo-ops-features-title">Allowed Features</h4>
        <ul className="geo-ops-feature-list">
          {wl.allowedFeatures.map((f) => (
            <li key={f} className="geo-ops-feature-item">
              {f}
            </li>
          ))}
        </ul>
      </div>
    </GlassPanel>
  );
}
