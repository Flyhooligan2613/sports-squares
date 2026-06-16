"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  MessageSquare,
  Search,
  Shield,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
  Crown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CommandCenterNavItem, CommandCenterRole } from "@/lib/platform/engines/commandCenter";
import { formatCommandCenterRole } from "@/lib/platform/engines/commandCenter";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  contests: Trophy,
  payments: Wallet,
  compliance: ShieldCheck,
  community: Users,
  support: MessageSquare,
  analytics: BarChart3,
  health: Gauge,
  alerts: AlertTriangle,
  executive: Crown,
  search: Search,
  audit: ClipboardList,
};

interface CommandCenterShellProps {
  role: CommandCenterRole;
  navItems: CommandCenterNavItem[];
  children: React.ReactNode;
}

export default function CommandCenterShell({
  role,
  navItems,
  children,
}: CommandCenterShellProps) {
  const pathname = usePathname();

  return (
    <div className="max-w-[1400px] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-sb-glow mb-1">
            Internal · Ops Only
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Command Center™
          </h1>
          <p className="text-sb-muted text-sm mt-1">
            Live platform orchestration — role:{" "}
            <span className="text-sb-secondary">{formatCommandCenterRole(role)}</span>
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-sb-muted hover:text-white transition-colors"
        >
          ← Classic Admin
        </Link>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <aside className="xl:w-56 shrink-0">
          <nav className="flex xl:flex-col gap-1 overflow-x-auto pb-1 xl:pb-0 -mx-1 px-1">
            {navItems.map((item) => {
              const active =
                item.href === "/admin/command-center"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              const Icon = ICONS[item.id] ?? Activity;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={item.description}
                  className={[
                    "sb-nav-link inline-flex items-center gap-2 whitespace-nowrap text-sm",
                    active ? "sb-nav-link-active" : "sb-nav-link-inactive",
                  ].join(" ")}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
