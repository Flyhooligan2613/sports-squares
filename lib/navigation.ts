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
    id: "play",
    title: "Play",
    items: [
      { href: "/games/nfl", label: "Browse Games", icon: "🏈" },
      { href: "/my-games", label: "My Games", icon: "🎮" },
      { href: "/live-tv", label: "LIVE TV", icon: "📺", badgeKey: "live" },
      { href: "/action-center", label: "Action Center", icon: "⚡" },
      { href: "/live-winners", label: "Live Winners", icon: "🏆" },
      { href: "/favorites", label: "Favorites", icon: "❤️" },
    ],
  },
  {
    id: "account",
    title: "Account",
    items: [
      { href: "/my-games/winnings", label: "My Winnings", icon: "💰", requiresAuth: true },
      { href: "/my-games/history", label: "Purchase History", icon: "🧾", requiresAuth: true },
      { href: "/my-games/notifications", label: "Notifications", icon: "🔔", badgeKey: "notifications", requiresAuth: true },
      { href: "/my-games/profile", label: "Settings", icon: "⚙️", requiresAuth: true },
    ],
  },
  {
    id: "learn",
    title: "Learn",
    items: [
      { href: "/learn/how-to-play", label: "How to Play", icon: "📖" },
      { href: "/learn/videos", label: "Video Tutorials", icon: "🎥" },
      { href: "/learn/rules", label: "Sports Squares Rules", icon: "🏈" },
      { href: "/faq", label: "Frequently Asked Questions", icon: "❓" },
    ],
  },
  {
    id: "support",
    title: "Support",
    items: [
      { href: "/support/help-center", label: "Help Center", icon: "💬" },
      { href: "/support/messages", label: "Message Center", icon: "📨", badgeKey: "messages" },
      { href: "/contact", label: "Contact Us", icon: "📞" },
      { href: "/support/report", label: "Report a Problem", icon: "🐞" },
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
  if (href === "/my-games") return pathname === "/my-games";
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}
