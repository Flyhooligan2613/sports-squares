import type { LucideIcon } from "lucide-react";
import {
  Database,
  Link2,
  Megaphone,
  Rocket,
  ScrollText,
  Shield,
  ShieldCheck,
  Sparkles,
  Bell,
  Trophy,
  Wallet,
  MessageSquare,
  Users,
} from "lucide-react";

export interface ClassicAdminNavItem {
  href: string;
  label: string;
  exact?: boolean;
  icon: LucideIcon;
}

/** Classic admin routes — linked from Command Center hub and legacy AdminShell. */
export const CLASSIC_ADMIN_NAV: ClassicAdminNavItem[] = [
  { href: "/admin/players", label: "Players", icon: Users },
  { href: "/admin/pools", label: "Pools", icon: Trophy },
  { href: "/admin/financial", label: "Financial", icon: Wallet },
  { href: "/admin/connect", label: "Cash-out", icon: Link2 },
  { href: "/admin/support", label: "Support", icon: MessageSquare },
  { href: "/admin/ecosystem", label: "Ecosystem", icon: Sparkles },
  { href: "/admin/security", label: "Security", icon: Shield },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/push-notifications", label: "Push Alerts", icon: Bell },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/admin/launch", label: "Launch", icon: Rocket },
  { href: "/admin/database-status", label: "Database", icon: Database },
  { href: "/transparency", label: "Transparency", icon: ShieldCheck },
];
