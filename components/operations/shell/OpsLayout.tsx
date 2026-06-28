"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { OpsContext } from "./OpsContext";

interface OpsLayoutProps {
  children: React.ReactNode;
}

export default function OpsLayout({ children }: OpsLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [founderMode, setFounderMode] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <OpsContext.Provider value={{ founderMode }}>
    <div className="ops-root">
      <div className="ops-ambient" aria-hidden="true">
        <div className="ops-ambient-orb ops-ambient-orb-1" />
        <div className="ops-ambient-orb ops-ambient-orb-2" />
        <div className="ops-ambient-grid" />
      </div>

      <button
        type="button"
        className="ops-mobile-nav-toggle"
        onClick={() => setMobileNavOpen((v) => !v)}
        aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileNavOpen}
      >
        <span className="ops-mobile-nav-bar" />
        <span className="ops-mobile-nav-bar" />
        <span className="ops-mobile-nav-bar" />
      </button>

      {mobileNavOpen && (
        <button
          type="button"
          className="ops-mobile-overlay"
          onClick={() => setMobileNavOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}

      <div className={`ops-sidebar-wrap ${mobileNavOpen ? "ops-sidebar-wrap-open" : ""}`}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
          founderMode={founderMode}
        />
      </div>

      <div className={`ops-main ${sidebarCollapsed ? "ops-main-expanded" : ""}`}>
        <TopNav
          founderMode={founderMode}
          onFounderModeToggle={() => setFounderMode((v) => !v)}
        />
        <main className="ops-content" id="ops-main-content">
          {children}
        </main>
      </div>
    </div>
    </OpsContext.Provider>
  );
}
