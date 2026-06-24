import { PLATFORM_TERMS } from "@/lib/platform/legacy/competitiveLanguage";
import { COMMUNITY_LABELS, PROFILE_LABELS } from "@/lib/platform/language";
import { TRUST_CENTER_SECTIONS } from "@/lib/trust/trustCenterSections";

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
  /** Smaller muted note beside the section title, e.g. "(legal)" */
  titleNote?: string;
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
      { href: "/my-games/profile", label: PROFILE_LABELS.competitorHub, icon: "👤", requiresAuth: true },
      { href: "/my-games/rewards", label: "My Rewards", icon: "🎁", requiresAuth: true },
      { href: "/my-games/rewards/tier", label: "Tier Progress", icon: "⭐", requiresAuth: true },
      { href: "/my-games/rewards/credits", label: "My Credits", icon: "💎", requiresAuth: true },
      { href: "/my-games/rewards/inventory", label: "My Trophies", icon: "🏆", requiresAuth: true },
      { href: "/my-games/rewards/square-drop", label: "Weekly Reward Drop", icon: "🎁", requiresAuth: true },
      { href: "/my-games/referrals", label: "Invite Friends", icon: "👥", requiresAuth: true },
      { href: "/my-games/wallet", label: "SquareWallet™", icon: "💳", requiresAuth: true },
      { href: "/my-games/winnings", label: PLATFORM_TERMS.contestWinnings, icon: "💰", requiresAuth: true },
      { href: "/my-games/history", label: PLATFORM_TERMS.competitionHistory, icon: "📜", requiresAuth: true },
    ],
  },
  {
    id: "player-live",
    title: "Live & Rankings",
    items: [
      { href: "/contest-center", label: PLATFORM_TERMS.contestCenter, icon: "⚡" },
      { href: "/live-winners", label: "Winners Center", icon: "🏆" },
      { href: "/leaderboards", label: COMMUNITY_LABELS.competitionRankings, icon: "📊" },
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
      { href: "/support", label: "Support", icon: "💬" },
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
    id: "trust-center",
    title: "Trust Center",
    items: TRUST_CENTER_SECTIONS.map((section) => ({
      href: section.route,
      label: section.title,
      icon: "•",
    })),
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
  if (href === "/contest-center" || href === "/action-center") {
    return pathname === "/action-center" || pathname === "/contest-center";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
