"use client";

import { Sparkles } from "lucide-react";
import { MOCK_SMART_RECOMMENDATIONS } from "@/lib/operations/geo-compliance/mockRecommendations";

const PRIORITY_CLASS = {
  high: "geo-rec-high",
  medium: "geo-rec-medium",
  low: "geo-rec-low",
};

export default function SmartRecommendations() {
  return (
    <section className="geo-section" aria-labelledby="geo-rec-heading">
      <header className="geo-section-header">
        <div className="geo-rec-header-title">
          <Sparkles className="w-5 h-5 geo-rec-sparkle" strokeWidth={1.75} aria-hidden="true" />
          <div>
            <h2 id="geo-rec-heading" className="geo-section-title">
              Smart Recommendations
            </h2>
            <p className="geo-section-subtitle">
              Mock AI insights — no automatic legal or state changes
            </p>
          </div>
        </div>
      </header>

      <div className="geo-rec-list">
        {MOCK_SMART_RECOMMENDATIONS.map((rec, i) => (
          <article
            key={rec.id}
            className={`geo-rec-card ${PRIORITY_CLASS[rec.priority]}`}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="geo-rec-meta">
              <span className={`geo-rec-priority geo-rec-priority-${rec.priority}`}>
                {rec.priority}
              </span>
              <span className="geo-rec-category">{rec.category}</span>
              {rec.metric && <span className="geo-rec-metric">{rec.metric}</span>}
            </div>
            <h3 className="geo-rec-title">{rec.title}</h3>
            <p className="geo-rec-desc">{rec.description}</p>
            <div className="geo-rec-states">
              {rec.stateIds.map((id) => (
                <span key={id} className="geo-rec-state-chip">
                  {id}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
