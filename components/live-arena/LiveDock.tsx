"use client";

import type { DockTab } from "@/lib/live-arena/types";

const TABS: { id: DockTab; icon: string; label: string }[] = [
  { id: "games", icon: "🏈", label: "Live Games" },
  { id: "winning", icon: "🏆", label: "Winning" },
  { id: "wallet", icon: "💰", label: "Wallet" },
  { id: "rewards", icon: "🎁", label: "Rewards" },
  { id: "profile", icon: "👤", label: "Profile" },
];

interface LiveDockProps {
  active: DockTab;
  onChange: (tab: DockTab) => void;
}

export default function LiveDock({ active, onChange }: LiveDockProps) {
  return (
    <nav
      className="la-dock fixed bottom-0 inset-x-0 z-50 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
      aria-label="Live arena navigation"
    >
      <div className="la-dock-inner max-w-[430px] mx-auto flex items-center justify-around gap-0.5">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={[
                "la-dock-tab",
                isActive ? "la-dock-tab--active" : "text-white/45 hover:text-white/65",
              ].join(" ")}
            >
              <span className="la-dock-icon" aria-hidden>
                {tab.icon}
              </span>
              <span className="la-dock-label">
                {tab.label.split(" ")[0]}
              </span>
              {isActive && <span className="la-dock-glow" aria-hidden />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
