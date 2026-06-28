"use client";

import { Bell, Calendar, TrendingUp, Users } from "lucide-react";
import type { GeoState } from "@/lib/operations/geo-compliance/types";

interface WaitlistPanelProps {
  state: GeoState | null;
}

export default function WaitlistPanel({ state }: WaitlistPanelProps) {
  if (!state?.waitlist) return null;
  if (state.status === "live") return null;

  const wl = state.waitlist;

  return (
    <section className="geo-waitlist-panel" aria-labelledby="geo-waitlist-heading">
      <header className="geo-waitlist-header">
        <h3 id="geo-waitlist-heading" className="geo-waitlist-title">
          Waitlist Management — {state.name}
        </h3>
        <p className="geo-waitlist-subtitle">
          Paid contests unavailable — limited features allowed
        </p>
      </header>

      <div className="geo-waitlist-stats">
        <div className="geo-waitlist-stat">
          <Users className="geo-waitlist-icon" strokeWidth={1.75} aria-hidden="true" />
          <span className="geo-waitlist-stat-value">{wl.currentWaitlist.toLocaleString()}</span>
          <span className="geo-waitlist-stat-label">Current Waitlist</span>
        </div>
        <div className="geo-waitlist-stat">
          <Calendar className="geo-waitlist-icon" strokeWidth={1.75} aria-hidden="true" />
          <span className="geo-waitlist-stat-value">{wl.projectedLaunch}</span>
          <span className="geo-waitlist-stat-label">Projected Launch</span>
        </div>
        <div className="geo-waitlist-stat">
          <Bell className="geo-waitlist-icon" strokeWidth={1.75} aria-hidden="true" />
          <span className="geo-waitlist-stat-value">{wl.notificationCount.toLocaleString()}</span>
          <span className="geo-waitlist-stat-label">Notification Count</span>
        </div>
        <div className="geo-waitlist-stat">
          <TrendingUp className="geo-waitlist-icon" strokeWidth={1.75} aria-hidden="true" />
          <span className="geo-waitlist-stat-value">{wl.interestScore}</span>
          <span className="geo-waitlist-stat-label">Interest Score</span>
        </div>
      </div>

      <div className="geo-waitlist-allowed">
        <h4 className="geo-waitlist-allowed-title">Allowed While Unavailable</h4>
        <ul className="geo-waitlist-feature-list">
          {wl.allowedFeatures.map((f) => (
            <li key={f} className="geo-waitlist-feature">
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
