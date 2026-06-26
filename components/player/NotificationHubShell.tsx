"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const HUB_TABS = [
  { href: "/my-games/notifications", label: "Notifications" },
  { href: "/my-games/activity", label: "Activity" },
  { href: "/my-games/notifications/settings", label: "Settings" },
] as const;

interface NotificationHubShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function NotificationHubShell({
  title,
  subtitle,
  children,
  actions,
}: NotificationHubShellProps) {
  const pathname = usePathname();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
            {title}
          </h1>
          <p className="text-sb-muted">{subtitle}</p>
        </div>
        {actions}
      </div>

      <nav
        className="flex gap-1 p-1 mb-8 rounded-xl bg-white/[0.03] border border-white/8 overflow-x-auto scrollbar-none"
        aria-label="Notification hub"
      >
        {HUB_TABS.map((tab) => {
          const active =
            tab.href === "/my-games/notifications"
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                "notification-hub-tab shrink-0 min-h-[44px] px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-[250ms]",
                active
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-sb-muted hover:text-white hover:bg-white/5",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
