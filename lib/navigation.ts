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
  /** Render platform game cards at the top of this section */
  renderGames?: "available" | "coming_soon";
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "main",
    title: "Play",
    renderGames: "available",
    items: [
      { href: "/", label: "Home", icon: "🏠" },
      { href: "/huddle", label: "The Huddle", icon: "👥" },
      { href: "/stats-hub", label: "Stats Hub", icon: "📊" },
      { href: "/my-games?mode=home", label: "Game Room", icon: "🎮", requiresAuth: true },
      { href: "/my-games?mode=gameday", label: "Game Day", icon: "🏈", requiresAuth: true },
      { href: "/live-tv", label: "Live TV", icon: "📺", badgeKey: "live" },
    ],
  },
  {
    id: "player",
    title: "Player",
    items: [
      { href: "/my-games/profile", label: "Player Hub", icon: "👤", requiresAuth: true },
      { href: "/my-games/rewards", label: "My Rewards", icon: "🎁", requiresAuth: true },
      { href: "/my-games/rewards/tier", label: "Tier Progress", icon: "⭐", requiresAuth: true },
      { href: "/my-games/rewards/credits", label: "My Credits", icon: "💎", requiresAuth: true },
      { href: "/my-games/rewards/inventory", label: "Inventory", icon: "🎒", requiresAuth: true },
      { href: "/my-games/rewards/square-drop", label: "Weekly Reward Drop", icon: "🎁", requiresAuth: true },
      { href: "/my-games/referrals", label: "Invite Friends", icon: "👥", requiresAuth: true },
      { href: "/my-games/winnings", label: "My Winnings", icon: "💰", requiresAuth: true },
      { href: "/my-games/history", label: "Win History", icon: "📜", requiresAuth: true },
    ],
  },
  {
    id: "player-live",
    title: "Live & Rankings",
    items: [
      { href: "/action-center", label: "Action Center", icon: "⚡" },
      { href: "/live-winners", label: "Winners Center", icon: "🏆" },
      { href: "/leaderboards", label: "Leaderboards", icon: "📊" },
    ],
  },
  {
    id: "upcoming",
    title: "Upcoming Games",
    renderGames: "coming_soon",
    items: [],
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
      { href: "/support/messages", label: "Messages", icon: "📨", badgeKey: "messages" },
      { href: "/contact", label: "Contact", icon: "☎️" },
    ],
  },
  {
    id: "account",
    title: "Account",
    items: [
      { href: "/my-games/security", label: "Security", icon: "🔒", requiresAuth: true },
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
  if (href === "/my-games" || href === "/my-games?mode=home") {
    return pathname === "/my-games" || pathname === "/home";
  }
  if (href === "/my-games?mode=gameday") {
    return pathname === "/game-day";
  }
  if (href === "/my-games/rewards") {
    return pathname === href;
  }
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}
