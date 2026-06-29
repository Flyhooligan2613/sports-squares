import type { OpsModuleConfig } from "./types";

export const OPS_MODULE_CONFIGS: Record<string, OpsModuleConfig> = {
  "geo-operations": {
    id: "geo-operations",
    title: "Geo Operations Center",
    subtitle: "Nationwide jurisdiction map, compliance alerts, expansion intelligence, and live ops.",
    highlights: ["37 live jurisdictions", "7 under review", "98.2% geo accuracy"],
    placeholderCards: [
      { title: "Jurisdiction Map", description: "Interactive US state overlay", type: "map" },
      { title: "Compliance Alerts", description: "Regulatory timeline & audit log", type: "alert" },
      { title: "Expansion Scores", description: "100-point state readiness index", type: "chart" },
      { title: "Live Operations", description: "Real-time geo ops pulse", type: "stat" },
    ],
  },
  players: {
    id: "players",
    title: "Players",
    subtitle: "Competitor profiles, tiers, restrictions, and lifecycle management.",
    highlights: ["48,291 total players", "1,842 online now", "127 pending review"],
    placeholderCards: [
      { title: "Player Directory", description: "Searchable competitor roster", type: "table" },
      { title: "Tier Distribution", description: "Legacy tier breakdown", type: "chart" },
      { title: "Recent Signups", description: "Last 24h registrations", type: "stat" },
      { title: "Top Competitors", description: "High-activity profiles", type: "analytics" },
    ],
  },
  contests: {
    id: "contests",
    title: "Contests",
    subtitle: "Live, upcoming, and settled contest orchestration across all sports.",
    highlights: ["342 active contests", "18 live now", "$284K prize pools"],
    placeholderCards: [
      { title: "Live Contests", description: "Real-time contest grid", type: "table" },
      { title: "Fill Rate", description: "Contest capacity utilization", type: "chart" },
      { title: "Featured Contests", description: "Highlighted contest cards", type: "analytics" },
      { title: "Settlement Queue", description: "Pending payout settlements", type: "stat" },
    ],
  },
  wallet: {
    id: "wallet",
    title: "Wallet",
    subtitle: "Deposits, withdrawals, holds, and treasury operations.",
    highlights: ["$42.8K revenue today", "23 pending withdrawals", "$1.2M in escrow"],
    placeholderCards: [
      { title: "Transaction Ledger", description: "Recent wallet activity", type: "table" },
      { title: "Cash Flow", description: "Deposits vs withdrawals", type: "chart" },
      { title: "Pending Withdrawals", description: "Queue requiring review", type: "stat" },
      { title: "Treasury Overview", description: "Balance & reserve metrics", type: "analytics" },
    ],
  },
  promotions: {
    id: "promotions",
    title: "Promotions",
    subtitle: "Campaigns, reward drops, Square Pass, and promotional tooling.",
    highlights: ["8 active campaigns", "2,841 redemptions today", "94% delivery rate"],
    placeholderCards: [
      { title: "Active Campaigns", description: "Running promotion list", type: "table" },
      { title: "Redemption Trend", description: "Daily redemption volume", type: "chart" },
      { title: "Reward Drops", description: "Scheduled reward events", type: "stat" },
      { title: "Campaign Performance", description: "Conversion & engagement", type: "analytics" },
    ],
  },
  "risk-center": {
    id: "risk-center",
    title: "Risk Center",
    subtitle: "Fraud signals, identity verification, and risk scoring.",
    highlights: ["14 open risk cases", "3 critical alerts", "99.1% KYC pass rate"],
    placeholderCards: [
      { title: "Risk Queue", description: "Cases requiring investigation", type: "table" },
      { title: "Signal Timeline", description: "Fraud signal frequency", type: "chart" },
      { title: "Critical Alerts", description: "High-severity risk events", type: "alert" },
      { title: "Risk Score Distribution", description: "Player risk tier breakdown", type: "analytics" },
    ],
  },
  reports: {
    id: "reports",
    title: "Reports",
    subtitle: "Analytics exports, scheduled reports, and executive summaries.",
    highlights: ["24 saved reports", "6 scheduled exports", "Last run: 2h ago"],
    placeholderCards: [
      { title: "Report Library", description: "Saved & scheduled reports", type: "table" },
      { title: "Revenue Analytics", description: "Monthly revenue trend", type: "chart" },
      { title: "Platform KPIs", description: "Key performance indicators", type: "stat" },
      { title: "Executive Summary", description: "Founder-ready snapshot", type: "analytics" },
    ],
  },
  notifications: {
    id: "notifications",
    title: "Notifications",
    subtitle: "Push notifications, in-app messaging, and delivery analytics.",
    highlights: ["12.4K sent today", "98.7% delivery rate", "3 campaigns queued"],
    placeholderCards: [
      { title: "Delivery Log", description: "Recent notification sends", type: "table" },
      { title: "Delivery Rate", description: "Push success over time", type: "chart" },
      { title: "Queued Messages", description: "Pending notification batch", type: "stat" },
      { title: "Audience Segments", description: "Target group breakdown", type: "analytics" },
    ],
  },
  settings: {
    id: "settings",
    title: "Settings",
    subtitle: "Platform configuration, roles, integrations, and feature flags.",
    highlights: ["42 config keys", "6 integrations active", "3 pending approvals"],
    placeholderCards: [
      { title: "Configuration", description: "Platform settings table", type: "table" },
      { title: "Integration Health", description: "Third-party service status", type: "chart" },
      { title: "Feature Flags", description: "Active toggles & rollouts", type: "stat" },
      { title: "Audit Trail", description: "Recent config changes", type: "alert" },
    ],
  },
  founder: {
    id: "founder",
    title: "Founder Dashboard",
    subtitle: "Executive overview — growth, revenue, trust, and strategic KPIs.",
    highlights: ["$1.8M MRR", "+12.4% MoM growth", "NPS 72"],
    placeholderCards: [
      { title: "Growth Metrics", description: "User & revenue growth", type: "chart" },
      { title: "Strategic KPIs", description: "North-star metrics", type: "stat" },
      { title: "Market Coverage", description: "Geographic expansion map", type: "map" },
      { title: "Platform Health", description: "Trust & reliability scorecard", type: "analytics" },
    ],
  },
};
