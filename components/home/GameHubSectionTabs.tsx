"use client";

import HubSectionLink from "@/components/home/HubSectionLink";
import {
  HUB_SECTION,
  type HubSectionTab,
  gameDaySection,
  gameRoomSection,
  parseHubHash,
} from "@/lib/home/hubSections";
import { usePathname, useSearchParams } from "next/navigation";

interface GameHubSectionTabsProps {
  tabs: HubSectionTab[];
  mode: "gameday" | "home";
}

export default function GameHubSectionTabs({ tabs, mode }: GameHubSectionTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeHash = parseHubHash();
  const currentMode = searchParams.get("mode");
  const onHub =
    pathname === "/my-games" &&
    (mode === "home" ? currentMode === "home" : currentMode !== "home");

  function sectionHref(section: HubSectionTab["section"]) {
    return mode === "home" ? gameRoomSection(section) : gameDaySection(section);
  }

  function isActive(section: HubSectionTab["section"]) {
    if (!onHub || !activeHash) return false;
    return activeHash === HUB_SECTION[section];
  }

  return (
    <nav className="hub-section-tabs" aria-label="Jump to section">
      <div className="hub-section-tabs-inner" role="tablist">
        {tabs.map((tab) => {
          const href = sectionHref(tab.section);
          const selected = isActive(tab.section);
          return (
            <HubSectionLink
              key={tab.id}
              href={href}
              role="tab"
              aria-selected={selected}
              className={[
                "hub-section-tab",
                selected ? "hub-section-tab-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {tab.emoji ? <span aria-hidden>{tab.emoji}</span> : null}
              {tab.label}
            </HubSectionLink>
          );
        })}
      </div>
    </nav>
  );
}
