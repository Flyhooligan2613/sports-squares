"use client";

import { cn } from "../utils/cn";

export interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface NavProps {
  items: NavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function Nav({ items, activeId, onSelect, className }: NavProps) {
  return (
    <nav className={cn("sqds-nav", className)} aria-label="Navigation">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={cn("sqds-nav__item", activeId === item.id && "sqds-nav__item--active")}
          onClick={() => onSelect?.(item.id)}
          aria-current={activeId === item.id ? "page" : undefined}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export interface NavTabsProps {
  tabs: NavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function NavTabs({ tabs, activeId, onSelect, className }: NavTabsProps) {
  return (
    <div className={cn("sqds-nav-tabs", className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeId === tab.id}
          className={cn("sqds-nav-tab", activeId === tab.id && "sqds-nav-tab--active")}
          onClick={() => onSelect?.(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
