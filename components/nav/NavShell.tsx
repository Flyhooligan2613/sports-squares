"use client";

import { GlobalSearchProvider } from "@/components/search/GlobalSearchProvider";
import { LiveActivityProvider } from "@/components/liveActivity/LiveActivityProvider";
import NavDrawer from "./NavDrawer";
import { NavDrawerProvider } from "./NavDrawerProvider";

export default function NavShell({ children }: { children: React.ReactNode }) {
  return (
    <NavDrawerProvider>
      <GlobalSearchProvider>
        <LiveActivityProvider>
          {children}
          <NavDrawer />
        </LiveActivityProvider>
      </GlobalSearchProvider>
    </NavDrawerProvider>
  );
}
