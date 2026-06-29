"use client";

import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Badge, GlassPanel } from "@/design-system";
import { MOCK_EXPANSION_SCORES } from "@/lib/operations/geo-operations";

const TREND_ICON = {
  up: TrendingUp,
  stable: Minus,
  down: TrendingDown,
};

export default function ExpansionIntelligence() {
  const topStates = MOCK_EXPANSION_SCORES.slice(0, 12);

  return (
    <section className="geo-section" aria-labelledby="geo-ops-expansion-heading">
      <header className="geo-section-header">
        <div>
          <h2 id="geo-ops-expansion-heading" className="geo-section-title">
            Expansion Intelligence
          </h2>
          <p className="geo-section-subtitle">
            100-point expansion score per state — recommendations only, admin approval required
          </p>
        </div>
      </header>

      <div className="geo-ops-expansion-grid">
        {topStates.map((item, i) => {
          const TrendIcon = TREND_ICON[item.trend];
          const scoreClass =
            item.score >= 75 ? "geo-ops-score-high" : item.score >= 45 ? "geo-ops-score-mid" : "geo-ops-score-low";

          return (
            <GlassPanel
              key={item.stateId}
              padding="sm"
              className={`geo-ops-expansion-card ${scoreClass}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="geo-ops-expansion-header">
                <span className="geo-ops-expansion-state">{item.stateName}</span>
                <Badge
                  variant={item.score >= 75 ? "live" : item.score >= 45 ? "review" : "disabled"}
                  label={`${item.score} pts`}
                />
              </div>
              <div className="geo-ops-expansion-score-bar">
                <div
                  className="geo-ops-expansion-score-fill"
                  style={{ width: `${item.score}%` }}
                  role="presentation"
                />
              </div>
              <ul className="geo-ops-expansion-metrics">
                <li>Waitlist Growth: {item.waitlistGrowth}</li>
                <li>Referral Interest: {item.referralInterest}</li>
                <li>Traffic: {item.traffic}</li>
                <li>Signups: {item.signups}</li>
                <li>Engagement: {item.engagement}</li>
                <li>Support Demand: {item.supportDemand}</li>
                <li>Revenue Potential: {item.revenuePotential}</li>
              </ul>
              <span className="geo-ops-expansion-trend">
                <TrendIcon className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                {item.trend}
              </span>
            </GlassPanel>
          );
        })}
      </div>
    </section>
  );
}
