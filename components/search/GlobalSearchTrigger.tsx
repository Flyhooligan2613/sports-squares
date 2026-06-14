"use client";

import { useGlobalSearchSafe } from "@/components/search/GlobalSearchProvider";

export default function GlobalSearchTrigger({
  compact = false,
  variant = "default",
  className = "",
}: {
  /** Icon-only on very small screens when false */
  compact?: boolean;
  /** Hero placement — always show label, full-width bar */
  variant?: "default" | "hero";
  className?: string;
}) {
  const search = useGlobalSearchSafe();
  if (!search) return null;

  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toLowerCase().includes("mac");
  const shortcut = isMac ? "⌘K" : "Ctrl K";
  const isHero = variant === "hero";
  const showLabel = isHero || !compact;

  return (
    <button
      type="button"
      onClick={search.open}
      className={[
        "global-search-trigger",
        compact ? "global-search-trigger-compact" : "",
        isHero ? "global-search-trigger-hero" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Search players and features"
    >
      <span className="global-search-trigger-icon" aria-hidden>
        🔍
      </span>
      {showLabel ? (
        <span
          className={[
            "global-search-trigger-label",
            isHero ? "" : "hidden sm:inline",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          Search players & features…
        </span>
      ) : null}
      {showLabel ? (
        <kbd
          className={[
            "global-search-trigger-kbd",
            isHero ? "hidden sm:inline-flex" : "hidden lg:inline-flex",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {shortcut}
        </kbd>
      ) : null}
    </button>
  );
}
