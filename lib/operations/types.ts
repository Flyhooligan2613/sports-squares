import type { LucideIcon } from "lucide-react";

export type OpsAccent = "blue" | "purple" | "success" | "gold" | "warning" | "danger" | "muted";

export interface OpsNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  founderOnly?: boolean;
}

export interface OpsStatCardData {
  id: string;
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  accent?: OpsAccent;
  icon?: LucideIcon;
}

export interface OpsPlayer {
  id: string;
  username: string;
  tier: string;
  status: "active" | "restricted" | "pending";
  region: string;
  balance: string;
  lastActive: string;
}

export interface OpsContest {
  id: string;
  name: string;
  sport: string;
  entries: number;
  capacity: number;
  prizePool: string;
  status: "live" | "upcoming" | "settled";
  startsIn: string;
}

export interface OpsAlert {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  source: string;
  timestamp: string;
}

export interface OpsModuleConfig {
  id: string;
  title: string;
  subtitle: string;
  highlights: string[];
  placeholderCards: Array<{
    title: string;
    description: string;
    type: "stat" | "chart" | "table" | "map" | "analytics" | "alert";
  }>;
}

export interface OpsAdminProfile {
  name: string;
  role: string;
  avatarInitials: string;
}
