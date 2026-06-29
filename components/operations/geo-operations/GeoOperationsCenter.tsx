"use client";

import { useCallback, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import "@/design-system/sqds.css";
import { Badge, Button } from "@/design-system";
import { useOpsContext } from "@/components/operations/shell/OpsContext";
import {
  MOCK_GEO_OPS_STATES,
  MOCK_GEO_OPS_STATES_MAP,
  getGeoSummary,
} from "@/lib/operations/geo-operations/mockStates";
import UsMap from "./UsMap";
import StateDetailDrawer from "./StateDetailDrawer";
import ComplianceAlertsCenter from "./ComplianceAlertsCenter";
import WaitlistPanel from "./WaitlistPanel";
import HeatMapsPanel from "./HeatMapsPanel";
import FounderInsights from "./FounderInsights";
import LiveHealthBar from "./LiveHealthBar";
import GeoSearchPanel from "./GeoSearchPanel";
import PlayerLocationEngine from "./PlayerLocationEngine";
import ExpansionIntelligence from "./ExpansionIntelligence";
import LiveOperationsPanel from "./LiveOperationsPanel";
import ReportingPanel from "./ReportingPanel";
import "../geo-compliance/geo-compliance.css";
import "./geo-operations.css";

const ZOOM_MIN = 0.85;
const ZOOM_MAX = 1.6;
const ZOOM_STEP = 0.12;

export default function GeoOperationsCenter() {
  const { founderMode } = useOpsContext();
  const [selectedId, setSelectedId] = useState<string | null>("FL");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const summary = getGeoSummary();
  const selectedState = selectedId ? MOCK_GEO_OPS_STATES_MAP[selectedId] ?? null : null;

  const handleSelectState = useCallback((id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  return (
    <div className="sqds-root geo-ops-center ops-fade-in">
      <LiveHealthBar />

      <header className="geo-header geo-ops-header">
        <div className="geo-header-text">
          <p className="ops-page-eyebrow">Project Titan · Sprint 3</p>
          <h1 className="ops-page-title">Geo Operations Center™</h1>
          <p className="ops-page-subtitle">
            Nationwide operational brain — recommendations only, admin approval required.
          </p>
        </div>
        <div className="geo-header-actions">
          <GeoSearchPanel onSelectState={handleSelectState} />
          <div className="geo-summary-chips">
            <Badge variant="live" label={`${summary.live} live`} />
            <Badge variant="review" label={`${summary.review} review`} />
            <Badge variant="disabled" label={`${summary.disabled} disabled`} />
          </div>
        </div>
      </header>

      <LiveOperationsPanel />

      <div className="geo-ops-map-layout">
        <section className="geo-map-section geo-ops-map-hero" aria-label="United States geo operations map">
          <div className="geo-map-toolbar">
            <h2 className="geo-map-title">Nationwide Jurisdiction Map</h2>
            <div className="geo-zoom-controls">
              <Button
                variant="glass"
                size="sm"
                onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
                aria-label="Zoom out"
                disabled={zoom <= ZOOM_MIN}
              >
                <Minus className="w-4 h-4" strokeWidth={1.75} />
              </Button>
              <span className="geo-zoom-level">{Math.round(zoom * 100)}%</span>
              <Button
                variant="glass"
                size="sm"
                onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
                aria-label="Zoom in"
                disabled={zoom >= ZOOM_MAX}
              >
                <Plus className="w-4 h-4" strokeWidth={1.75} />
              </Button>
              <Button variant="glass" size="sm" onClick={() => setZoom(1)} aria-label="Reset zoom">
                <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
              </Button>
            </div>
          </div>

          <UsMap
            states={MOCK_GEO_OPS_STATES_MAP}
            selectedId={selectedId}
            onSelect={handleSelectState}
            zoom={zoom}
            className="geo-map-primary geo-ops-map-primary"
          />

          {selectedState && (
            <div className="geo-map-selection-banner">
              <Badge
                variant={
                  selectedState.status === "live"
                    ? "live"
                    : selectedState.status === "under_review"
                      ? "review"
                      : "disabled"
                }
                label={selectedState.name}
              />
              <span className="geo-map-selection-meta">
                {selectedState.registeredPlayers.toLocaleString()} players ·{" "}
                ${(selectedState.revenue / 1000).toFixed(0)}K revenue · Risk {selectedState.riskScore}
              </span>
              <Button variant="primary" size="sm" onClick={() => setDrawerOpen(true)}>
                View details
              </Button>
            </div>
          )}
        </section>

        <aside className="geo-ops-side-rail">
          <WaitlistPanel state={selectedState} />
          <ComplianceAlertsCenter filterStateId={selectedId} />
        </aside>
      </div>

      <StateDetailDrawer state={selectedState} open={drawerOpen} onClose={handleCloseDrawer} />

      <PlayerLocationEngine />
      <ExpansionIntelligence />
      <HeatMapsPanel states={MOCK_GEO_OPS_STATES} selectedId={selectedId} />
      {founderMode && <FounderInsights />}
      <ReportingPanel />
    </div>
  );
}
