"use client";

import { useMemo, useState } from "react";
import type { GeoState } from "@/lib/operations/geo-compliance/types";
import { US_MAP_PATHS, US_MAP_VIEWBOX } from "@/lib/operations/geo-compliance/usMapPaths";
import type { GeoStateStatus } from "@/lib/operations/geo-compliance/types";

interface UsMapProps {
  states: Record<string, GeoState>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  zoom: number;
  className?: string;
}

const STATUS_COLORS: Record<GeoStateStatus, { fill: string; stroke: string; glow: string }> = {
  live: {
    fill: "rgba(34, 229, 132, 0.35)",
    stroke: "rgba(34, 229, 132, 0.85)",
    glow: "rgba(34, 229, 132, 0.55)",
  },
  under_review: {
    fill: "rgba(251, 191, 36, 0.35)",
    stroke: "rgba(251, 191, 36, 0.9)",
    glow: "rgba(251, 191, 36, 0.5)",
  },
  disabled: {
    fill: "rgba(248, 113, 113, 0.3)",
    stroke: "rgba(248, 113, 113, 0.85)",
    glow: "rgba(248, 113, 113, 0.45)",
  },
};

export default function UsMap({
  states,
  selectedId,
  onSelect,
  zoom,
  className = "",
}: UsMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const transform = useMemo(() => {
    const cx = 340;
    const cy = 280;
    return `translate(${cx}, ${cy}) scale(${zoom}) translate(${-cx}, ${-cy})`;
  }, [zoom]);

  return (
    <div className={`geo-map-wrap ${className}`}>
      <div className="geo-map-glow" aria-hidden="true" />
      <svg
        viewBox={US_MAP_VIEWBOX}
        className="geo-map-svg"
        role="img"
        aria-label="Interactive United States compliance map"
      >
        <defs>
          <filter id="geo-state-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="geo-map-vignette" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(99,102,241,0.08)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.04)" />
          </linearGradient>
        </defs>

        <rect
          x="0"
          y="0"
          width="680"
          height="560"
          fill="url(#geo-map-vignette)"
          rx="12"
        />

        <g className="geo-map-states" transform={transform}>
          {US_MAP_PATHS.map((sp) => {
            const state = states[sp.id];
            const status = state?.status ?? "disabled";
            const colors = STATUS_COLORS[status];
            const isSelected = selectedId === sp.id;
            const isHovered = hoveredId === sp.id;

            return (
              <g key={sp.id}>
                {isSelected && (
                  <path
                    d={sp.path}
                    className="geo-state-glow-ring"
                    fill="none"
                    stroke={colors.glow}
                    strokeWidth={6}
                    filter="url(#geo-state-glow)"
                    aria-hidden="true"
                  />
                )}
                <path
                  d={sp.path}
                  className={`geo-state-path ${isSelected ? "geo-state-selected" : ""} ${isHovered ? "geo-state-hovered" : ""}`}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={isSelected ? 2 : 1}
                  onClick={() => onSelect(sp.id)}
                  onMouseEnter={() => setHoveredId(sp.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(sp.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${sp.name}, ${status.replace("_", " ")}`}
                  aria-pressed={isSelected}
                />
                {(isSelected || isHovered || zoom >= 1.15) && sp.id !== "DC" && (
                  <text
                    x={sp.labelX}
                    y={sp.labelY}
                    className="geo-state-label"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    pointerEvents="none"
                  >
                    {sp.id}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="geo-map-legend" aria-label="Map legend">
        <span className="geo-legend-item geo-legend-live">
          <span className="geo-legend-dot" aria-hidden="true" />
          Live
        </span>
        <span className="geo-legend-item geo-legend-review">
          <span className="geo-legend-dot" aria-hidden="true" />
          Under Review
        </span>
        <span className="geo-legend-item geo-legend-disabled">
          <span className="geo-legend-dot" aria-hidden="true" />
          Disabled
        </span>
      </div>
    </div>
  );
}
