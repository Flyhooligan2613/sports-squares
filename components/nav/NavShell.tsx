"use client";

import NavDrawer from "./NavDrawer";
import { NavDrawerProvider } from "./NavDrawerProvider";

export default function NavShell({ children }: { children: React.ReactNode }) {
  return (
    <NavDrawerProvider>
      {children}
      <NavDrawer />
    </NavDrawerProvider>
  );
}
