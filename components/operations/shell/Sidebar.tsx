"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Zap,
} from "lucide-react";
import { OPS_NAV_ITEMS } from "@/lib/operations/nav";
import { OPS_APP_NAME, OPS_APP_SHORT } from "@/lib/operations/constants";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  founderMode: boolean;
}

export default function Sidebar({ collapsed, onToggle, founderMode }: SidebarProps) {
  const pathname = usePathname();

  const navItems = founderMode
    ? OPS_NAV_ITEMS
    : OPS_NAV_ITEMS.filter((item) => !item.founderOnly);

  function isActive(href: string) {
    if (href === "/ops") return pathname === "/ops";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={`ops-sidebar ${collapsed ? "ops-sidebar-collapsed" : ""}`}
      aria-label="Operations navigation"
    >
      <div className="ops-sidebar-header">
        <Link href="/ops" className="ops-sidebar-brand">
          <span className="ops-sidebar-logo" aria-hidden="true">
            <Zap className="w-5 h-5" strokeWidth={2} />
          </span>
          {!collapsed && (
            <span className="ops-sidebar-brand-text">
              <span className="ops-sidebar-brand-title">{OPS_APP_SHORT}</span>
              <span className="ops-sidebar-brand-sub">Operations</span>
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className="ops-sidebar-toggle"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {!collapsed && (
        <p className="ops-sidebar-app-name">{OPS_APP_NAME}</p>
      )}

      <nav className="ops-sidebar-nav">
        <ul className="ops-sidebar-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`ops-sidebar-link ${active ? "ops-sidebar-link-active" : ""}`}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="ops-sidebar-link-icon" aria-hidden="true">
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                    {item.founderOnly && (
                      <Crown className="ops-sidebar-founder-badge w-3 h-3" />
                    )}
                  </span>
                  {!collapsed && (
                    <span className="ops-sidebar-link-text">
                      <span className="ops-sidebar-link-label">{item.label}</span>
                      {item.description && (
                        <span className="ops-sidebar-link-desc">{item.description}</span>
                      )}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="ops-sidebar-footer">
          <p className="ops-sidebar-footer-label">Sprint 1</p>
          <p className="ops-sidebar-footer-text">Architecture shell · Mock data</p>
        </div>
      )}
    </aside>
  );
}
