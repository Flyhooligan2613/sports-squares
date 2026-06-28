"use client";

import { useCallback, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useOpsContext } from "@/components/operations/shell/OpsContext";
import {
  MOCK_GEO_STATES,
  MOCK_GEO_STATES_MAP,
  getGeoSummary,
} from "@/lib/operations/geo-compliance/mockStates";
import UsMap from "./UsMap";
import StateDetailPanel from "./StateDetailPanel";
import ComplianceAlertTimeline from "./ComplianceAlertTimeline";
import WaitlistPanel from "./WaitlistPanel";
import DistributionHeatmaps from "./DistributionHeatmaps";
import FounderGeoInsights from "./FounderGeoInsights";
import OpsHealthBar from "./OpsHealthBar";
import SmartRecommendations from "./SmartRecommendations";
import GeoSearch from "./GeoSearch";
import "./geo-compliance.css";

const ZOOM_MIN = 0.85;
const ZOOM_MAX = 1.6;
const ZOOM_STEP = 0.12;

export default function GeoComplianceCenter() {
  const { founderMode } = useOpsContext();
  const [selectedId, setSelectedId] = useState<string | null>("FL");
  const [panelOpen, setPanelOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const summary = getGeoSummary();
  const selectedState = selectedId ? MOCK_GEO_STATES_MAP[selectedId] ?? null : null;

  const handleSelectState = useCallback((id: string) => {
    setSelectedId(id);
    setPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  return (
    <div className="geo-center ops-fade-in">
      <OpsHealthBar />

      <header className="geo-header">
        <div className="geo-header-text">
          <p className="ops-page-eyebrow">Project Titan · Sprint 2</p>
          <h1 className="ops-page-title">Geo Compliance Center™</h1>
          <p className="ops-page-subtitle">
            Operational heart of jurisdiction coverage — recommendations only, admin approval required.
          </p>
        </div>
        <div className="geo-header-actions">
          <GeoSearch onSelectState={handleSelectState} />
          <div className="geo-summary-chips">
            <span className="geo-chip geo-chip-live">{summary.live} live</span>
            <span className="geo-chip geo-chip-review">{summary.review} review</span>
            <span className="geo-chip geo-chip-disabled">{summary.disabled} disabled</span>
          </div>
        </div>
      </header>

      <div className="geo-main-layout">
        <section className="geo-map-section" aria-label="United States compliance map">
          <div className="geo-map-toolbar">
            <h2 className="geo-map-title">Jurisdiction Map</h2>
            <div className="geo-zoom-controls">
              <button
                type="button"
                className="geo-zoom-btn"
                onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
                aria-label="Zoom out"
                disabled={zoom <= ZOOM_MIN}
              >
                <Minus className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <span className="geo-zoom-level">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                className="geo-zoom-btn"
                onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
                aria-label="Zoom in"
                disabled={zoom >= ZOOM_MAX}
              >
                <Plus className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                className="geo-zoom-btn"
                onClick={() => setZoom(1)}
                aria-label="Reset zoom"
              >
                <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          <UsMap
            states={MOCK_GEO_STATES_MAP}
            selectedId={selectedId}
            onSelect={handleSelectState}
            zoom={zoom}
            className="geo-map-primary"
          />

          {selectedState && (
            <div className="geo-map-selection-banner">
              <span className={`geo-status-badge geo-status-${selectedState.status}`}>
                {selectedState.name}
              </span>
              <span className="geo-map-selection-meta">
                {selectedState.registeredPlayers.toLocaleString()} players ·{" "}
                ${(selectedState.revenue / 1000).toFixed(0)}K revenue
              </span>
              <button
                type="button"
                className="geo-map-details-btn"
                onClick={() => setPanelOpen(true)}
              >
                View details
              </button>
            </div>
          )}
        </section>

        <aside className="geo-side-rail">
          <WaitlistPanel state={selectedState} />
          <div className="geo-side-alerts">
            <ComplianceAlertTimeline filterStateId={selectedId} />
          </div>
        </aside>
      </div>

      <StateDetailPanel
        state={selectedState}
        open={panelOpen}
        onClose={handleClosePanel}
      />

      <SmartRecommendations />

      {founderMode && <FounderGeoInsights />}

      <DistributionHeatmaps states={MOCK_GEO_STATES} selectedId={selectedId} />
    </div>
  );
}
