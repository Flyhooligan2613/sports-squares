"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOutAdmin } from "@/lib/auth/adminAuthClient";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/pools", label: "Pools", exact: false },
  { href: "/admin/database-status", label: "Database", exact: false },
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
      <aside className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/50 p-4">
        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3 px-2">
          Admin
        </p>
        <nav className="flex lg:flex-col gap-1">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors mt-0 lg:mt-2"
          >
            &larr; Public Site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-3 py-2 rounded-lg text-sm font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left mt-1 lg:mt-2 disabled:opacity-50"
          >
            {loggingOut ? "Signing out..." : "Log out"}
          </button>
        </nav>
      </aside>
      <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}
