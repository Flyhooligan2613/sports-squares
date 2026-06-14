"use client";

import { useGlobalSearchSafe } from "@/components/search/GlobalSearchProvider";

export default function GlobalSearchTrigger({
  compact = false,
  className = "",
}: {
  /** Icon-only on very small screens when false */
  compact?: boolean;
  className?: string;
}) {
  const search = useGlobalSearchSafe();
  if (!search) return null;

  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toLowerCase().includes("mac");
  const shortcut = isMac ? "⌘K" : "Ctrl K";

  return (
    <button
      type="button"
      onClick={search.open}
      className={[
        "global-search-trigger",
        compact ? "global-search-trigger-compact" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Search players and features"
    >
      <span className="global-search-trigger-icon" aria-hidden>
        🔍
      </span>
      {!compact && (
        <span className="global-search-trigger-label hidden sm:inline">
          Search players & features…
        </span>
      )}
      {!compact && (
        <kbd className="global-search-trigger-kbd hidden lg:inline-flex">{shortcut}</kbd>
      )}
    </button>
  );
}
