"use client";

import {
  AlertCard,
  AnalyticsCard,
  Chart,
  ContestCard,
  PlayerCard,
  StatCard,
} from "@/components/operations/ui";
import {
  MOCK_ALERTS,
  MOCK_CONTESTS,
  MOCK_DASHBOARD_STATS,
  MOCK_PLAYERS,
} from "@/components/operations/mock/dashboard";

export default function OpsDashboardView() {
  return (
    <div className="ops-page ops-fade-in">
      <header className="ops-page-header">
        <div>
          <p className="ops-page-eyebrow">Project Titan · Sprint 1</p>
          <h1 className="ops-page-title">Operations Dashboard</h1>
          <p className="ops-page-subtitle">
            Real-time platform pulse — mock data for architecture preview.
          </p>
        </div>
        <div className="ops-status-pill">
          <span className="ops-status-dot" aria-hidden="true" />
          All systems operational
        </div>
      </header>

      <section aria-labelledby="ops-kpi-heading">
        <h2 id="ops-kpi-heading" className="ops-section-title">
          Key Metrics
        </h2>
        <div className="ops-stat-grid">
          {MOCK_DASHBOARD_STATS.map((stat, i) => (
            <StatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              trend={stat.trend}
              accent={stat.accent}
              icon={stat.icon}
              delay={i * 60}
            />
          ))}
        </div>
      </section>

      <div className="ops-dashboard-grid">
        <Chart
          title="Revenue Trend"
          subtitle="Last 12 hours — mock preview"
          className="ops-dashboard-chart"
        />
        <AnalyticsCard
          title="Platform Analytics"
          subtitle="Engagement & retention snapshot"
          metrics={[
            { label: "DAU", value: "12.4K", change: "+6.2%" },
            { label: "Retention", value: "68%", change: "+2.1%" },
            { label: "Avg Session", value: "18m", change: "+0.8m" },
          ]}
          className="ops-dashboard-analytics"
        />
      </div>

      <section aria-labelledby="ops-alerts-heading">
        <h2 id="ops-alerts-heading" className="ops-section-title">
          Active Alerts
        </h2>
        <div className="ops-alert-list">
          {MOCK_ALERTS.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </section>

      <div className="ops-dashboard-split">
        <section aria-labelledby="ops-players-heading">
          <h2 id="ops-players-heading" className="ops-section-title">
            Recent Players
          </h2>
          <div className="ops-player-list">
            {MOCK_PLAYERS.slice(0, 4).map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </section>

        <section aria-labelledby="ops-contests-heading">
          <h2 id="ops-contests-heading" className="ops-section-title">
            Live Contests
          </h2>
          <div className="ops-contest-list">
            {MOCK_CONTESTS.filter((c) => c.status === "live").map((contest) => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
