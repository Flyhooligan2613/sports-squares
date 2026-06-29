"use client";

import { FileSpreadsheet, FileText, Download } from "lucide-react";
import { Button, GlassPanel } from "@/design-system";

const EXPORT_FORMATS = [
  { id: "csv", label: "CSV", icon: FileText },
  { id: "excel", label: "Excel", icon: FileSpreadsheet },
  { id: "pdf", label: "PDF", icon: FileText },
] as const;

const REPORT_PERIODS = ["Daily", "Weekly", "Monthly", "Quarterly", "Annual"] as const;

export default function ReportingPanel() {
  return (
    <section className="geo-section" aria-labelledby="geo-ops-reporting-heading">
      <header className="geo-section-header">
        <div>
          <h2 id="geo-ops-reporting-heading" className="geo-section-title">
            Reporting
          </h2>
          <p className="geo-section-subtitle">
            Export and scheduled reports — UI only, no real export yet
          </p>
        </div>
      </header>

      <div className="geo-ops-reporting-grid">
        <GlassPanel padding="md" className="geo-ops-reporting-card">
          <h3 className="geo-ops-reporting-title">Export Format</h3>
          <div className="geo-ops-reporting-actions">
            {EXPORT_FORMATS.map((fmt) => {
              const Icon = fmt.icon;
              return (
                <Button key={fmt.id} variant="glass" size="sm">
                  <Icon className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  {fmt.label}
                </Button>
              );
            })}
          </div>
        </GlassPanel>

        <GlassPanel padding="md" className="geo-ops-reporting-card">
          <h3 className="geo-ops-reporting-title">Generate Report</h3>
          <div className="geo-ops-reporting-actions">
            {REPORT_PERIODS.map((period) => (
              <Button key={period} variant="secondary" size="sm">
                {period}
              </Button>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel padding="md" className="geo-ops-reporting-card geo-ops-reporting-full">
          <h3 className="geo-ops-reporting-title">Quick Export</h3>
          <p className="geo-ops-reporting-desc">
            Export current map view, selected state details, or full nationwide snapshot.
          </p>
          <Button variant="executive" size="md">
            <Download className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            Export Geo Operations Snapshot
          </Button>
        </GlassPanel>
      </div>
    </section>
  );
}
