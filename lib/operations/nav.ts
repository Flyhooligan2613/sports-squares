import {
  BarChart3,
  Bell,
  Crown,
  Gift,
  Globe2,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import type { OpsNavItem } from "./types";
import { OPS_ROUTE_PREFIX } from "./constants";

export const OPS_NAV_ITEMS: OpsNavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: OPS_ROUTE_PREFIX,
    icon: LayoutDashboard,
    description: "Real-time platform pulse",
  },
  {
    id: "geo-compliance",
    label: "Geo Compliance",
    href: `${OPS_ROUTE_PREFIX}/geo-compliance`,
    icon: Globe2,
    description: "Jurisdiction & geo-fencing",
  },
  {
    id: "players",
    label: "Players",
    href: `${OPS_ROUTE_PREFIX}/players`,
    icon: Users,
    description: "Competitor lifecycle",
  },
  {
    id: "contests",
    label: "Contests",
    href: `${OPS_ROUTE_PREFIX}/contests`,
    icon: Trophy,
    description: "Contest orchestration",
  },
  {
    id: "wallet",
    label: "Wallet",
    href: `${OPS_ROUTE_PREFIX}/wallet`,
    icon: Wallet,
    description: "Deposits & withdrawals",
  },
  {
    id: "promotions",
    label: "Promotions",
    href: `${OPS_ROUTE_PREFIX}/promotions`,
    icon: Gift,
    description: "Campaigns & rewards",
  },
  {
    id: "risk-center",
    label: "Risk Center",
    href: `${OPS_ROUTE_PREFIX}/risk-center`,
    icon: ShieldAlert,
    description: "Fraud & risk signals",
  },
  {
    id: "reports",
    label: "Reports",
    href: `${OPS_ROUTE_PREFIX}/reports`,
    icon: BarChart3,
    description: "Analytics & exports",
  },
  {
    id: "notifications",
    label: "Notifications",
    href: `${OPS_ROUTE_PREFIX}/notifications`,
    icon: Bell,
    description: "Push & messaging",
  },
  {
    id: "settings",
    label: "Settings",
    href: `${OPS_ROUTE_PREFIX}/settings`,
    icon: Settings,
    description: "Platform configuration",
  },
  {
    id: "founder",
    label: "Founder Dashboard",
    href: `${OPS_ROUTE_PREFIX}/founder`,
    icon: Crown,
    description: "Executive overview",
    founderOnly: true,
  },
];

export function getOpsNavItem(id: string): OpsNavItem | undefined {
  return OPS_NAV_ITEMS.find((item) => item.id === id);
}
