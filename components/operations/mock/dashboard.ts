import {
  AlertTriangle,
  DollarSign,
  Gamepad2,
  Headphones,
  ShieldAlert,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import type { OpsAlert, OpsContest, OpsPlayer, OpsStatCardData } from "@/lib/operations/types";

export const MOCK_DASHBOARD_STATS: OpsStatCardData[] = [
  {
    id: "players-online",
    label: "Players Online",
    value: "1,842",
    change: "+8.2%",
    trend: "up",
    accent: "success",
    icon: Users,
  },
  {
    id: "live-games",
    label: "Live Games",
    value: "18",
    change: "+3",
    trend: "up",
    accent: "purple",
    icon: Gamepad2,
  },
  {
    id: "revenue-today",
    label: "Revenue Today",
    value: "$42,840",
    change: "+14.1%",
    trend: "up",
    accent: "gold",
    icon: DollarSign,
  },
  {
    id: "pending-withdrawals",
    label: "Pending Withdrawals",
    value: "23",
    change: "5 urgent",
    trend: "neutral",
    accent: "warning",
    icon: Wallet,
  },
  {
    id: "compliance-alerts",
    label: "Compliance Alerts",
    value: "7",
    change: "2 new",
    trend: "down",
    accent: "blue",
    icon: ShieldCheck,
  },
  {
    id: "risk-alerts",
    label: "Risk Alerts",
    value: "14",
    change: "3 critical",
    trend: "down",
    accent: "danger",
    icon: ShieldAlert,
  },
  {
    id: "support-tickets",
    label: "Support Tickets",
    value: "31",
    change: "12 open",
    trend: "neutral",
    accent: "muted",
    icon: Headphones,
  },
];

export const MOCK_ALERTS: OpsAlert[] = [
  {
    id: "alert-1",
    title: "Geo-fence violation spike",
    message: "Unusual volume of blocked access attempts from TX region.",
    severity: "warning",
    source: "Geo Compliance",
    timestamp: "12 min ago",
  },
  {
    id: "alert-2",
    title: "Withdrawal hold triggered",
    message: "Player #48291 flagged for manual review — $2,400 pending.",
    severity: "critical",
    source: "Risk Center",
    timestamp: "28 min ago",
  },
  {
    id: "alert-3",
    title: "KYC batch completed",
    message: "847 identity verifications processed with 99.1% pass rate.",
    severity: "info",
    source: "Compliance",
    timestamp: "1h ago",
  },
  {
    id: "alert-4",
    title: "Contest fill rate drop",
    message: "NFL Sunday contests at 62% capacity — below 75% threshold.",
    severity: "warning",
    source: "Contests",
    timestamp: "2h ago",
  },
];

export const MOCK_PLAYERS: OpsPlayer[] = [
  {
    id: "p-001",
    username: "GridIronKing",
    tier: "Platinum",
    status: "active",
    region: "NY",
    balance: "$1,240",
    lastActive: "2m ago",
  },
  {
    id: "p-002",
    username: "SquareMaster42",
    tier: "Gold",
    status: "active",
    region: "CA",
    balance: "$890",
    lastActive: "5m ago",
  },
  {
    id: "p-003",
    username: "LegacyChaser",
    tier: "Diamond",
    status: "restricted",
    region: "FL",
    balance: "$3,420",
    lastActive: "18m ago",
  },
  {
    id: "p-004",
    username: "ContestPro",
    tier: "Silver",
    status: "active",
    region: "TX",
    balance: "$320",
    lastActive: "1h ago",
  },
  {
    id: "p-005",
    username: "NewCompetitor",
    tier: "Bronze",
    status: "pending",
    region: "OH",
    balance: "$0",
    lastActive: "Just now",
  },
];

export const MOCK_CONTESTS: OpsContest[] = [
  {
    id: "c-001",
    name: "Super Bowl Squares XLIX",
    sport: "NFL",
    entries: 98,
    capacity: 100,
    prizePool: "$10,000",
    status: "live",
    startsIn: "Live now",
  },
  {
    id: "c-002",
    name: "March Madness Bracket",
    sport: "NCAA",
    entries: 412,
    capacity: 500,
    prizePool: "$25,000",
    status: "upcoming",
    startsIn: "4h 22m",
  },
  {
    id: "c-003",
    name: "NBA Playoffs Pick'em",
    sport: "NBA",
    entries: 256,
    capacity: 256,
    prizePool: "$8,400",
    status: "live",
    startsIn: "Live now",
  },
  {
    id: "c-004",
    name: "MLB Opening Day",
    sport: "MLB",
    entries: 64,
    capacity: 100,
    prizePool: "$2,500",
    status: "upcoming",
    startsIn: "1d 6h",
  },
];

export const MOCK_NOTIFICATIONS = [
  { id: "n-1", title: "Withdrawal approved", time: "5m ago", read: false },
  { id: "n-2", title: "New risk case assigned", time: "18m ago", read: false },
  { id: "n-3", title: "Daily report ready", time: "1h ago", read: true },
];

export const MOCK_COMPLIANCE_ALERTS = [
  { id: "ca-1", region: "TX", count: 142, severity: "warning" as const },
  { id: "ca-2", region: "FL", count: 38, severity: "info" as const },
  { id: "ca-3", region: "NY", count: 12, severity: "info" as const },
];

export const MOCK_SEARCH_SUGGESTIONS = [
  "GridIronKing",
  "Super Bowl Squares",
  "Pending withdrawals",
  "Risk case #48291",
];
