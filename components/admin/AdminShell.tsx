"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Radar } from "lucide-react";
import Logo from "@/components/Logo";
import { CLASSIC_ADMIN_NAV } from "@/lib/admin/classicNav";
import { signOutAdmin } from "@/lib/auth/adminAuthClient";

const NAV = [
  { href: "/admin/command-center", label: "Command Center", exact: false, icon: Radar },
  ...CLASSIC_ADMIN_NAV,
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await signOutAdmin();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row">
      <aside className="lg:w-60 shrink-0 border-b lg:border-b-0 lg:border-r border-white/[0.06] bg-sb-surface/40 backdrop-blur-xl p-4 lg:p-5">
        <div className="mb-6 px-1 hidden lg:block">
          <Logo href="/" className="text-sm" />
          <p className="text-sb-muted text-xs mt-2 font-medium uppercase tracking-wider">
            Admin Console
          </p>
        </div>
        <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "sb-nav-link inline-flex items-center gap-2.5 whitespace-nowrap",
                  active ? "sb-nav-link-active" : "sb-nav-link-inactive",
                ].join(" ")}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="sb-nav-link sb-nav-link-inactive mt-0 lg:mt-3"
          >
            ← Public Site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="sb-nav-link text-red-400/80 hover:text-red-300 hover:bg-red-500/10 text-left mt-1 lg:mt-2 disabled:opacity-50 inline-flex items-center gap-2.5"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
            {loggingOut ? "Signing out..." : "Log out"}
          </button>
        </nav>
      </aside>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 sb-page-enter">{children}</div>
    </div>
  );
}
