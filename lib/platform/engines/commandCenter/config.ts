import type { CommandCenterRole, CommandCenterSectionId } from "./types";

/** Default role when no per-email mapping is configured. */
export const DEFAULT_COMMAND_CENTER_ROLE: CommandCenterRole = "operations";

/**
 * Optional per-admin role map via env JSON:
 * COMMAND_CENTER_ROLE_MAP={"ops@example.com":"operations","finance@example.com":"finance"}
 */
export function parseCommandCenterRoleMap(): Record<string, CommandCenterRole> {
  const raw = process.env.COMMAND_CENTER_ROLE_MAP;
  if (!raw?.trim()) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    const valid: CommandCenterRole[] = [
      "support",
      "finance",
      "compliance",
      "marketing",
      "operations",
      "executive",
      "engineering",
    ];
    const out: Record<string, CommandCenterRole> = {};
    for (const [email, role] of Object.entries(parsed)) {
      if (valid.includes(role as CommandCenterRole)) {
        out[email.toLowerCase().trim()] = role as CommandCenterRole;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export interface CommandCenterNavItem {
  id: CommandCenterSectionId;
  label: string;
  href: string;
  description: string;
  roles: CommandCenterRole[] | "all";
}

export const COMMAND_CENTER_NAV: CommandCenterNavItem[] = [
  {
    id: "dashboard",
    label: "Overview",
    href: "/admin/command-center",
    description: "Live platform overview and activity feed.",
    roles: "all",
  },
  {
    id: "players",
    label: "Players",
    href: "/admin/command-center/players",
    description: "Search, filter, and manage competitor accounts.",
    roles: ["operations", "support", "compliance", "executive"],
  },
  {
    id: "contests",
    label: "Contests",
    href: "/admin/command-center/contests",
    description: "Active boards, fill rates, and contest lifecycle.",
    roles: ["operations", "marketing", "executive", "engineering"],
  },
  {
    id: "payments",
    label: "Wallet",
    href: "/admin/command-center/payments",
    description: "Deposits, withdrawals, holds, and Transaction Center.",
    roles: ["finance", "operations", "executive", "compliance"],
  },
  {
    id: "finance",
    label: "Finance",
    href: "/admin/command-center/finance",
    description: "SquareBank™ ledger health, volume, and reconciliation.",
    roles: ["finance", "operations", "executive", "compliance"],
  },
  {
    id: "compliance",
    label: "Verification",
    href: "/admin/command-center/compliance",
    description: "Identity verification queues and KYC monitoring.",
    roles: ["compliance", "operations", "executive"],
  },
  {
    id: "support",
    label: "Support",
    href: "/admin/command-center/support",
    description: "Support threads and response metrics.",
    roles: ["support", "operations"],
  },
  {
    id: "announcements",
    label: "Announcements",
    href: "/admin/command-center/announcements",
    description: "Platform announcements and broadcast studio.",
    roles: ["marketing", "operations", "executive"],
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/admin/command-center/analytics",
    description: "Filterable charts and platform metrics.",
    roles: ["marketing", "executive", "operations", "engineering"],
  },
  {
    id: "security",
    label: "Security",
    href: "/admin/command-center/security",
    description: "Account security, suspensions, and login monitoring.",
    roles: ["compliance", "operations", "engineering"],
  },
  {
    id: "health",
    label: "System Health",
    href: "/admin/command-center/health",
    description: "Infrastructure, webhooks, and database status.",
    roles: ["engineering", "operations", "executive"],
  },
  {
    id: "alerts",
    label: "Alerts",
    href: "/admin/command-center/alerts",
    description: "Configurable alerts with severity thresholds.",
    roles: ["operations", "engineering", "executive", "finance", "compliance"],
  },
  {
    id: "audit",
    label: "Audit Log",
    href: "/admin/command-center/audit",
    description: "Immutable platform event stream.",
    roles: ["compliance", "operations", "engineering", "finance"],
  },
  {
    id: "search",
    label: "Search",
    href: "/admin/command-center/search",
    description: "Search pools, players, payments, and audit events.",
    roles: "all",
  },
  {
    id: "executive",
    label: "Executive",
    href: "/admin/command-center/executive",
    description: "High-level KPIs for leadership.",
    roles: ["executive", "operations"],
  },
  {
    id: "community",
    label: "Community",
    href: "/admin/command-center/community",
    description: "Huddle activity, reputation, and engagement.",
    roles: ["marketing", "operations", "support"],
  },
];

export function navItemsForRole(role: CommandCenterRole): CommandCenterNavItem[] {
  return COMMAND_CENTER_NAV.filter(
    (item) => item.roles === "all" || item.roles.includes(role)
  );
}

export function canAccessSection(role: CommandCenterRole, sectionId: CommandCenterSectionId): boolean {
  const item = COMMAND_CENTER_NAV.find((nav) => nav.id === sectionId);
  if (!item) return false;
  return item.roles === "all" || item.roles.includes(role);
}

/** Minutes of inactivity before a competitor is no longer counted as online. */
export const COMPETITOR_ONLINE_WINDOW_MINUTES = 15;

/** Activity feed poll interval recommendation (ms) — client-side default. */
export const ACTIVITY_FEED_POLL_MS = 30_000;
