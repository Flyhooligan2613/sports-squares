"use client";

import type { ContestFilterId } from "@/lib/contestCenter/types";
import { CONTEST_FILTERS } from "@/lib/contestCenter/labels";

interface ContestFiltersProps {
  active: ContestFilterId;
  onChange: (id: ContestFilterId) => void;
}

export default function ContestFilters({ active, onChange }: ContestFiltersProps) {
  return (
    <div className="cc-filters" role="tablist" aria-label="Filter contests">
      <div className="cc-filters-scroll">
        {CONTEST_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={active === filter.id}
            className={[
              "cc-filter-pill",
              active === filter.id ? "cc-filter-pill-active" : "",
            ].join(" ")}
            onClick={() => onChange(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
