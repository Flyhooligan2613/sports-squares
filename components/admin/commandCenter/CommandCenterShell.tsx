"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageSquare,
  Search,
  Shield,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
  Crown,
  Globe2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Logo from "@/components/Logo";
import { CLASSIC_ADMIN_NAV } from "@/lib/admin/classicNav";
import { signOutAdmin } from "@/lib/auth/adminAuthClient";
import type { CommandCenterNavItem, CommandCenterRole } from "@/lib/platform/engines/commandCenter";
import { formatCommandCenterRole } from "@/lib/platform/engines/commandCenter";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  players: Users,
  contests: Trophy,
  payments: Wallet,
  finance: Wallet,
  compliance: ShieldCheck,
  "geo-operations": Globe2,
  community: Users,
  support: MessageSquare,
  announcements: Megaphone,
  analytics: BarChart3,
  security: Shield,
  health: Gauge,
  alerts: AlertTriangle,
  executive: Crown,
  search: Search,
  audit: ClipboardList,
};

const PLATFORM_ROLES = [
  "Owner",
  "Admin",
  "Support",
  "Compliance",
  "Finance",
  "Moderator",
] as const;

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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  function handleQuickSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q.length < 2) return;
    router.push(`/admin/command-center/search?q=${encodeURIComponent(q)}`);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await signOutAdmin();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="max-w-[1400px] space-y-6">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <Logo href="/" className="text-sm shrink-0" />
            <div className="min-w-0 border-l border-white/10 pl-4">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-sb-glow mb-0.5">
                Internal · Mission Control
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                Command Center™
              </h1>
              <p className="text-sb-muted text-xs sm:text-sm mt-0.5">
                Role:{" "}
                <span className="text-sb-secondary">{formatCommandCenterRole(role)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              className="text-xs sm:text-sm text-sb-muted hover:text-white transition-colors"
            >
              Public Site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-red-400/80 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
              {loggingOut ? "Signing out…" : "Log out"}
            </button>
          </div>
        </div>

        <form onSubmit={handleQuickSearch} className="flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sb-muted pointer-events-none"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick search players, pools, payments…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-sb-muted focus:outline-none focus:border-sb-purple/40"
            />
          </div>
          <button
            type="submit"
            disabled={searchQuery.trim().length < 2}
            className="rounded-xl border border-white/10 bg-sb-purple/20 px-4 py-2.5 text-sm font-medium text-white hover:bg-sb-purple/30 disabled:opacity-40 transition-colors"
          >
            Search
          </button>
        </form>
      </header>

      <div className="flex flex-col xl:flex-row gap-6">
        <aside className="xl:w-56 shrink-0 space-y-6">
          <nav aria-label="Command Center modules" className="flex xl:flex-col gap-1 overflow-x-auto pb-1 xl:pb-0 -mx-1 px-1">
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

          <div className="hidden xl:block">
            <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-sb-muted mb-2 px-1">
              Classic Admin
            </p>
            <nav aria-label="Classic admin tools" className="flex flex-col gap-1">
              {CLASSIC_ADMIN_NAV.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
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
          </div>

          <footer className="hidden xl:block pt-4 border-t border-white/[0.06]">
            <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-sb-muted mb-2">
              Platform roles
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORM_ROLES.map((r) => (
                <span
                  key={r}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-sb-muted bg-white/[0.02]"
                >
                  {r}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-sb-muted mt-3 leading-relaxed">
              Role mapping via <code className="text-sb-glow">COMMAND_CENTER_ROLE_MAP</code> env.
            </p>
          </footer>
        </aside>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
