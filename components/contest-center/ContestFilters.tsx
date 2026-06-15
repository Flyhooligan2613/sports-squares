"use client";

import Link from "next/link";
import type { ContestFilterId } from "@/lib/contestCenter/types";
import { CONTEST_FILTER_TABS, CONTEST_SPORT_TABS } from "@/lib/contestCenter/labels";

interface ContestFiltersProps {
  active: ContestFilterId;
  onChange: (id: ContestFilterId) => void;
}

export default function ContestFilters({ active, onChange }: ContestFiltersProps) {
  function handleFilter(id: ContestFilterId) {
    onChange(id);
    window.requestAnimationFrame(() => {
      const targetId =
        id === "private"
          ? "cc-private-contests"
          : id === "friends"
            ? "cc-friends-playing"
            : id === "trending"
              ? "cc-trending-contests"
              : "cc-live-contests";
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    });
  }

  return (
    <div className="cc-filters-wrap">
      <div className="cc-filters" role="tablist" aria-label="Browse contests by sport">
        <div className="cc-filters-scroll cc-sport-tabs">
          {CONTEST_SPORT_TABS.map((sport) => (
            <Link
              key={sport.id}
              href={sport.href}
              prefetch
              scroll
              role="tab"
              className="cc-sport-tab"
            >
              <span className="cc-sport-tab-emoji" aria-hidden>
                {sport.emoji}
              </span>
              {sport.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="cc-filters" role="tablist" aria-label="Filter contests">
        <div className="cc-filters-scroll">
          {CONTEST_FILTER_TABS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={active === filter.id}
              className={[
                "cc-filter-pill",
                active === filter.id ? "cc-filter-pill-active" : "",
              ].join(" ")}
              onClick={() => handleFilter(filter.id)}
            >
              {filter.emoji ? (
                <span className="cc-filter-pill-emoji" aria-hidden>
                  {filter.emoji}
                </span>
              ) : null}
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
