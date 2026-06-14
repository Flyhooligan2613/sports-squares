"use client";

import { GlobalSearchProvider } from "@/components/search/GlobalSearchProvider";
import NavDrawer from "./NavDrawer";
import { NavDrawerProvider } from "./NavDrawerProvider";

export default function NavShell({ children }: { children: React.ReactNode }) {
  return (
    <NavDrawerProvider>
      <GlobalSearchProvider>
        {children}
        <NavDrawer />
      </GlobalSearchProvider>
    </NavDrawerProvider>
  );
}
