export interface NavItem {
  href: string;
  label: string;
  icon: string;
  badgeKey?: "messages" | "notifications" | "live";
  requiresAuth?: boolean;
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "main",
    title: "Main",
    items: [
      { href: "/", label: "Home", icon: "🏠" },
      { href: "/live-tv", label: "Live TV", icon: "📺", badgeKey: "live" },
      { href: "/action-center", label: "Action Center", icon: "⚡" },
      { href: "/live-winners", label: "Winners Center", icon: "🏆" },
      { href: "/leaderboards", label: "Leaderboards", icon: "📊" },
      { href: "/my-games", label: "My Games", icon: "🎮", requiresAuth: true },
      {
        href: "/my-games/notifications",
        label: "Notifications",
        icon: "🔔",
        badgeKey: "notifications",
        requiresAuth: true,
      },
    ],
  },
  {
    id: "learn",
    title: "Learn",
    items: [
      { href: "/learn/how-to-play", label: "How To Play", icon: "📖" },
      { href: "/transparency", label: "Transparency Center", icon: "🔍" },
      { href: "/faq", label: "FAQ", icon: "❓" },
    ],
  },
  {
    id: "support",
    title: "Support",
    items: [
      { href: "/support/help-center", label: "Support", icon: "💬" },
      { href: "/support/messages", label: "Message Center", icon: "📨", badgeKey: "messages" },
      { href: "/contact", label: "Contact", icon: "📞" },
    ],
  },
  {
    id: "account",
    title: "Account",
    items: [
      { href: "/my-games/winnings", label: "My Winnings", icon: "💰", requiresAuth: true },
      { href: "/my-games/history", label: "Win History", icon: "🧾", requiresAuth: true },
      { href: "/my-games/profile", label: "Settings", icon: "⚙️", requiresAuth: true },
      { href: "/favorites", label: "Favorites", icon: "❤️" },
    ],
  },
  {
    id: "legal",
    title: "Legal",
    items: [
      { href: "/privacy", label: "Privacy", icon: "•" },
      { href: "/terms", label: "Terms", icon: "•" },
      { href: "/responsible-gaming", label: "Responsible Gaming", icon: "•" },
    ],
  },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/my-games") return pathname === "/my-games";
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}
