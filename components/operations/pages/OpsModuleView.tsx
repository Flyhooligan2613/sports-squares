"use client";

import {
  AlertCard,
  AnalyticsCard,
  Chart,
  Map,
  StatCard,
  Table,
} from "@/components/operations/ui";
import { OPS_MODULE_CONFIGS } from "@/lib/operations/modules";

interface OpsModuleViewProps {
  moduleId: string;
}

function PlaceholderCard({
  title,
  description,
  type,
}: {
  title: string;
  description: string;
  type: "stat" | "chart" | "table" | "map" | "analytics" | "alert";
}) {
  switch (type) {
    case "stat":
      return (
        <StatCard
          label={title}
          value="—"
          change={description}
          accent="muted"
        />
      );
    case "chart":
      return <Chart title={title} subtitle={description} />;
    case "table":
      return <Table title={title} subtitle={description} rows={4} />;
    case "map":
      return <Map title={title} subtitle={description} />;
    case "analytics":
      return (
        <AnalyticsCard
          title={title}
          subtitle={description}
          metrics={[
            { label: "Metric A", value: "—", change: "Preview" },
            { label: "Metric B", value: "—", change: "Preview" },
            { label: "Metric C", value: "—", change: "Preview" },
          ]}
        />
      );
    case "alert":
      return (
        <AlertCard
          alert={{
            id: "placeholder",
            title,
            message: description,
            severity: "info",
            source: "System",
            timestamp: "Preview",
          }}
        />
      );
    default:
      return null;
  }
}

export default function OpsModuleView({ moduleId }: OpsModuleViewProps) {
  const config = OPS_MODULE_CONFIGS[moduleId];

  if (!config) {
    return (
      <div className="ops-page">
        <p className="ops-error-text">Module not found.</p>
      </div>
    );
  }

  return (
    <div className="ops-page ops-fade-in">
      <header className="ops-page-header">
        <div>
          <p className="ops-page-eyebrow">Project Titan · Sprint 1</p>
          <h1 className="ops-page-title">{config.title}</h1>
          <p className="ops-page-subtitle">{config.subtitle}</p>
        </div>
        <div className="ops-highlights">
          {config.highlights.map((h) => (
            <span key={h} className="ops-highlight-chip">
              {h}
            </span>
          ))}
        </div>
      </header>

      <div className="ops-module-grid">
        {config.placeholderCards.map((card, i) => (
          <div
            key={card.title}
            className="ops-module-grid-item"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <PlaceholderCard
              title={card.title}
              description={card.description}
              type={card.type}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
