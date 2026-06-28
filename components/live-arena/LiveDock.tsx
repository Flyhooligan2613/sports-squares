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
      <div className="max-w-[430px] mx-auto flex items-center justify-around gap-0.5">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={[
                "flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all duration-300 min-w-[56px]",
                isActive
                  ? "text-blue-300 bg-blue-500/15 scale-105"
                  : "text-white/50 hover:text-white/70",
              ].join(" ")}
            >
              <span className="text-base leading-none" aria-hidden>
                {tab.icon}
              </span>
              <span className="text-[9px] font-medium leading-tight">
                {tab.label.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
