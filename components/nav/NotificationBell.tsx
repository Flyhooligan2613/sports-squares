"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNavDrawerSafe } from "@/components/nav/NavDrawerProvider";

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className = "" }: NotificationBellProps) {
  const nav = useNavDrawerSafe();
  const unread = nav?.unreadNotifications ?? 0;

  return (
    <Link
      href="/my-games/notifications"
      className={[
        "notification-bell nav-header-icon relative inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl",
        "text-sb-muted hover:text-white hover:bg-white/5 transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-glow/40",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={
        unread > 0
          ? `Notifications, ${unread} unread`
          : "Notifications"
      }
    >
      <Bell className="w-5 h-5" strokeWidth={1.75} aria-hidden />
      {unread > 0 ? (
        <span className="notification-bell-badge" aria-hidden>
          {unread > 99 ? "99+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
