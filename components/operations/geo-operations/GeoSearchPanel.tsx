"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { GeoSearchResult } from "@/lib/operations/geo-operations/types";
import { MOCK_GEO_OPS_STATES } from "@/lib/operations/geo-operations/mockStates";
import { MOCK_COMPLIANCE_ALERTS } from "@/lib/operations/geo-operations";

interface GeoSearchPanelProps {
  onSelectState: (stateId: string) => void;
}

function buildSearchIndex(): GeoSearchResult[] {
  const results: GeoSearchResult[] = [];

  for (const state of MOCK_GEO_OPS_STATES) {
    results.push({
      id: `state-${state.id}`,
      type: "state",
      label: state.name,
      sublabel: `${state.status.replace("_", " ")} · ${state.registeredPlayers.toLocaleString()} players`,
      stateId: state.id,
    });
    results.push({
      id: `city-${state.id}`,
      type: "state",
      label: `${state.name} metro`,
      sublabel: `City search · ${state.id}`,
      stateId: state.id,
    });
    results.push({
      id: `zip-${state.id}`,
      type: "state",
      label: `ZIP ${10000 + state.id.charCodeAt(0) * 100}`,
      sublabel: `${state.name} area`,
      stateId: state.id,
    });
    if (state.revenue > 100000) {
      results.push({
        id: `rev-${state.id}`,
        type: "revenue",
        label: `${state.name} revenue`,
        sublabel: `$${(state.revenue / 1000).toFixed(0)}K`,
        stateId: state.id,
      });
    }
    if (state.openBoards > 0) {
      results.push({
        id: `contest-${state.id}`,
        type: "contest",
        label: `${state.name} contests`,
        sublabel: `${state.openBoards} open boards`,
        stateId: state.id,
      });
    }
  }

  for (const alert of MOCK_COMPLIANCE_ALERTS) {
    results.push({
      id: `alert-${alert.id}`,
      type: "alert",
      label: alert.title,
      sublabel: `${alert.stateName} · ${alert.severity}`,
      stateId: alert.stateId,
    });
  }

  results.push(
    {
      id: "player-tx-1",
      type: "player",
      label: "Competitor_TX_2847",
      sublabel: "Texas · Tier Gold",
      stateId: "TX",
    },
    {
      id: "player-fl-1",
      type: "player",
      label: "Competitor_FL_9921",
      sublabel: "Florida · Tier Platinum",
      stateId: "FL",
    },
    {
      id: "player-ca-1",
      type: "player",
      label: "Competitor_CA_4412",
      sublabel: "California · Waitlist",
      stateId: "CA",
    },
  );

  return results;
}

const SEARCH_INDEX = buildSearchIndex();

const TYPE_LABELS: Record<GeoSearchResult["type"], string> = {
  state: "State",
  player: "Player",
  alert: "Alert",
  revenue: "Revenue",
  contest: "Contest",
};

const FILTER_TYPES = ["All", "State", "City", "ZIP", "Player", "Contest", "Alert", "Revenue"] as const;

export default function GeoSearchPanel({ onSelectState }: GeoSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState<(typeof FILTER_TYPES)[number]>("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    let filtered = SEARCH_INDEX.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.sublabel.toLowerCase().includes(q) ||
        r.type.includes(q),
    );

    if (activeFilter !== "All") {
      const filterMap: Record<string, GeoSearchResult["type"] | "city" | "zip"> = {
        State: "state",
        City: "state",
        ZIP: "state",
        Player: "player",
        Contest: "contest",
        Alert: "alert",
        Revenue: "revenue",
      };
      const type = filterMap[activeFilter];
      if (type === "state" && activeFilter === "City") {
        filtered = filtered.filter((r) => r.id.startsWith("city-"));
      } else if (type === "state" && activeFilter === "ZIP") {
        filtered = filtered.filter((r) => r.id.startsWith("zip-"));
      } else if (type === "state" && activeFilter === "State") {
        filtered = filtered.filter((r) => r.id.startsWith("state-"));
      } else if (type && type !== "state") {
        filtered = filtered.filter((r) => r.type === type);
      }
    }

    return filtered.slice(0, 8);
  }, [query, activeFilter]);

  function handleSelect(result: GeoSearchResult) {
    if (result.stateId) onSelectState(result.stateId);
    setQuery("");
    setFocused(false);
  }

  return (
    <div className={`geo-search geo-ops-search ${focused ? "geo-search-focused" : ""}`}>
      <Search className="geo-search-icon" strokeWidth={1.75} aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Search state, city, ZIP, player, contest, alert, revenue…"
        className="geo-search-input sqds-input"
        aria-label="Search geo operations"
        aria-expanded={focused && results.length > 0}
        aria-controls="geo-ops-search-results"
      />
      {query && (
        <button
          type="button"
          className="geo-search-clear"
          onClick={() => setQuery("")}
          aria-label="Clear search"
        >
          <X className="w-4 h-4" strokeWidth={1.75} />
        </button>
      )}

      <div className="geo-ops-search-filters" role="group" aria-label="Search filters">
        {FILTER_TYPES.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`geo-ops-filter-chip ${activeFilter === filter ? "geo-ops-filter-active" : ""}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {focused && results.length > 0 && (
        <ul id="geo-ops-search-results" className="geo-search-results" role="listbox">
          {results.map((result) => (
            <li key={result.id} role="option">
              <button
                type="button"
                className="geo-search-result"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(result)}
              >
                <span className="geo-search-result-type">{TYPE_LABELS[result.type]}</span>
                <span className="geo-search-result-label">{result.label}</span>
                <span className="geo-search-result-sub">{result.sublabel}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
