"use client";

import { Suspense } from "react";
import { GlobalSearchProvider } from "@/components/search/GlobalSearchProvider";
import { LiveActivityProvider } from "@/components/liveActivity/LiveActivityProvider";
import CashOutSetupGate from "@/components/auth/CashOutSetupGate";
import PlayerRoutePrefetch from "@/components/nav/PlayerRoutePrefetch";
import NavHistoryTracker from "@/components/nav/NavHistoryTracker";
import NavDrawer from "./NavDrawer";
import { NavDrawerProvider } from "./NavDrawerProvider";

export default function NavShell({ children }: { children: React.ReactNode }) {
  return (
    <NavDrawerProvider>
      <GlobalSearchProvider>
        <LiveActivityProvider>
          <PlayerRoutePrefetch />
          <Suspense fallback={null}>
            <NavHistoryTracker />
          </Suspense>
          {children}
          <CashOutSetupGate />
          <Suspense fallback={null}>
            <NavDrawer />
          </Suspense>
        </LiveActivityProvider>
      </GlobalSearchProvider>
    </NavDrawerProvider>
  );
}
