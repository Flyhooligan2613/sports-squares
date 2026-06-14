"use client";

import { GlobalSearchProvider } from "@/components/search/GlobalSearchProvider";
import { LiveActivityProvider } from "@/components/liveActivity/LiveActivityProvider";
import CashOutSetupGate from "@/components/auth/CashOutSetupGate";
import NavDrawer from "./NavDrawer";
import { NavDrawerProvider } from "./NavDrawerProvider";

export default function NavShell({ children }: { children: React.ReactNode }) {
  return (
    <NavDrawerProvider>
      <GlobalSearchProvider>
        <LiveActivityProvider>
          {children}
          <CashOutSetupGate />
          <NavDrawer />
        </LiveActivityProvider>
      </GlobalSearchProvider>
    </NavDrawerProvider>
  );
}
