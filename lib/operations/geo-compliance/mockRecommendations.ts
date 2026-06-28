import type { SmartRecommendation } from "./types";

export const MOCK_SMART_RECOMMENDATIONS: SmartRecommendation[] = [
  {
    id: "rec-tx-waitlist",
    title: "Texas waitlist accelerating",
    description:
      "Texas waitlist grew 34% this month (18,420 enrolled). Prepare launch strategy documentation and inventory allocation — admin approval required before any status change.",
    priority: "high",
    category: "expansion",
    stateIds: ["TX"],
    metric: "+34% waitlist MoM",
  },
  {
    id: "rec-fl-participation",
    title: "Florida participation surge",
    description:
      "Florida shows +22% contest participation week-over-week. Recommend increasing contest inventory and featured board slots — recommendation only, ops approval required.",
    priority: "high",
    category: "inventory",
    stateIds: ["FL"],
    metric: "+22% participation",
  },
  {
    id: "rec-ca-legal",
    title: "California legal monitoring",
    description:
      "California interest score at 94 with 42K waitlist. Monitor AG opinion timeline and maintain legal counsel checkpoint — do not auto-enable paid contests.",
    priority: "medium",
    category: "compliance",
    stateIds: ["CA"],
    metric: "94 interest score",
  },
  {
    id: "rec-ny-retention",
    title: "New York retention leader",
    description:
      "NY posts 78% 30-day retention — highest among live jurisdictions. Consider replicating onboarding flow in expansion states.",
    priority: "medium",
    category: "retention",
    stateIds: ["NY"],
    metric: "78% retention",
  },
  {
    id: "rec-co-expansion",
    title: "Colorado expansion opportunity",
    description:
      "Colorado under review with strong sports engagement signals. Complete payment processor alignment before Q2 2027 target window.",
    priority: "low",
    category: "expansion",
    stateIds: ["CO"],
    metric: "Q2 2027 target",
  },
  {
    id: "rec-multi-conversion",
    title: "Midwest conversion optimization",
    description:
      "IL, OH, and IN show above-average waitlist-to-active conversion when contests launch. Prioritize compliance reviews for batch expansion.",
    priority: "medium",
    category: "expansion",
    stateIds: ["IL", "OH", "IN"],
    metric: "High conversion signal",
  },
];
