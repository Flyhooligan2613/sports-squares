import type { GeoState, GeoStateStatus } from "./types";

const LIVE_STATES = new Set([
  "FL", "NY", "IL", "OH", "GA", "NC", "MI", "VA", "WA", "AZ", "TN",
  "IN", "MO", "MD", "WI", "MN", "SC", "AL", "KY", "LA", "OR", "CT", "KS",
  "IA", "MS", "AR", "OK", "NM", "NE", "WV", "ID", "MT", "WY", "ND", "SD",
  "DC",
]);

const UNDER_REVIEW = new Set(["CA", "CO", "NJ", "PA", "MA", "NV", "TX"]);

const DISABLED = new Set([
  "HI", "AK", "UT", "VT", "ME", "NH", "RI", "DE",
]);

const DISABLED_REASONS: Record<string, string> = {
  HI: "Pending island gaming framework review",
  AK: "Remote jurisdiction — regulatory assessment in progress",
  UT: "Skill contest restrictions — legal review required",
  VT: "Small market — awaiting compliance certification",
  ME: "Legislative session review pending",
  NH: "Awaiting multi-state compact alignment",
  RI: "Compact negotiation in progress",
  DE: "Legacy gaming overlap — legal clearance pending",
};

const ADMINS = [
  "Sarah Chen", "Marcus Webb", "Elena Rodriguez", "James Okonkwo", "Priya Sharma",
];

const CONTEST_TYPES = ["Squares", "Pick'em", "Survivor", "Bracket", "Props"];
const SPORTS = ["NFL", "NBA", "MLB", "NHL", "NCAAF", "NCAAB", "MLS", "UFC"];
const PAYMENTS = ["Debit Card", "ACH", "Apple Pay", "Google Pay", "PayPal"];

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

function statusFor(id: string): GeoStateStatus {
  if (DISABLED.has(id)) return "disabled";
  if (UNDER_REVIEW.has(id)) return "under_review";
  if (LIVE_STATES.has(id)) return "live";
  return "live";
}

function buildState(id: string, name: string, pop: number): GeoState {
  const h = hashCode(id);
  const status = statusFor(id);
  const live = status === "live";
  const factor = pop / 1_000_000;

  const registered = live
    ? Math.floor(factor * 4200 + (h % 8000))
    : Math.floor(factor * 800 + (h % 2000));
  const active = Math.floor(registered * (0.22 + (h % 15) / 100));
  const revenue = live
    ? Math.floor(factor * 890000 + (h % 500000))
    : Math.floor(factor * 45000 + (h % 80000));
  const alerts = id === "FL" ? 0 : id === "CA" ? 3 : id === "TX" ? 2 : id === "NY" ? 1 : h % 4;

  const sportsCount = live ? 5 + (h % 4) : status === "under_review" ? 3 + (h % 2) : 2;
  const contestCount = live ? 3 + (h % 3) : 1 + (h % 2);

  const state: GeoState = {
    id,
    name,
    status,
    disabledReason: status === "disabled" ? DISABLED_REASONS[id] : undefined,
    population: pop,
    registeredPlayers: registered,
    activePlayers: active,
    revenue,
    walletVolume: revenue * (2.4 + (h % 10) / 10),
    openBoards: live ? 12 + (h % 40) : status === "under_review" ? 2 + (h % 5) : 0,
    completedBoards: live ? 180 + (h % 900) : 20 + (h % 80),
    chargebackRate: live ? 0.08 + (h % 20) / 100 : 0,
    verificationRate: live ? 94 + (h % 5) : status === "under_review" ? 88 + (h % 6) : 0,
    referralCount: Math.floor(registered * 0.12),
    supportTickets: live ? 3 + (h % 28) : h % 12,
    complianceAlerts: alerts,
    contestTypesEnabled: CONTEST_TYPES.slice(0, contestCount),
    sportsEnabled: SPORTS.slice(0, sportsCount),
    maxPrizePool: live ? 5000 + (h % 45000) : 0,
    depositLimit: live ? 500 + (h % 4500) : 0,
    withdrawalLimit: live ? 500 + (h % 3500) : 0,
    ageRequirement: 18 + (h % 3 === 0 ? 3 : 0),
    kycRequirement: live ? "Enhanced KYC required" : status === "under_review" ? "Standard KYC pending approval" : "Not applicable",
    paymentMethods: live ? PAYMENTS.slice(0, 3 + (h % 3)) : [],
    notes: status === "live"
      ? `${name} operating normally. Last compliance review passed.`
      : status === "under_review"
        ? `${name} under internal legal review — no auto-changes permitted.`
        : `${name} unavailable for paid contests. Waitlist active.`,
    administrator: ADMINS[h % ADMINS.length],
    lastUpdated: `2026-06-${String(10 + (h % 18)).padStart(2, "0")}T${String(8 + (h % 12)).padStart(2, "0")}:00:00Z`,
    distribution: {
      playersRank: 1 + (h % 51),
      revenueRank: 1 + ((h * 3) % 51),
      deposits: Math.floor(revenue * 1.8),
      avgContestSize: live ? 18 + (h % 80) : 0,
      referralActivity: Math.floor(registered * 0.08),
      growthTrend: live ? -5 + (h % 35) : status === "under_review" ? 8 + (h % 25) : 12 + (h % 40),
    },
  };

  if (status === "disabled" || status === "under_review") {
    state.waitlist = {
      currentWaitlist: Math.floor(factor * 1200 + (h % 8000)),
      projectedLaunch: status === "under_review"
        ? `Q${1 + (h % 3)} 2026`
        : `Q${3 + (h % 2)} 2026`,
      notificationCount: Math.floor(factor * 400 + (h % 2000)),
      interestScore: 40 + (h % 55),
      allowedFeatures: [
        "Account Creation",
        "Profile",
        "Following",
        "Watching Live Boards",
        "Community",
        "Notifications",
        "Waitlist Enrollment",
      ],
    };
  }

  if (id === "TX" && state.waitlist) {
    state.waitlist = {
      ...state.waitlist,
      currentWaitlist: 18420,
      interestScore: 92,
      projectedLaunch: "Q3 2026",
    };
  }

  if (id === "FL") {
    state.distribution.growthTrend = 22;
    state.complianceAlerts = 0;
  }

  return state;
}

const STATE_DATA: Array<[string, string, number]> = [
  ["AL", "Alabama", 5024279], ["AK", "Alaska", 733391], ["AZ", "Arizona", 7151502],
  ["AR", "Arkansas", 3011524], ["CA", "California", 39538223], ["CO", "Colorado", 5773714],
  ["CT", "Connecticut", 3605944], ["DE", "Delaware", 989948], ["DC", "District of Columbia", 689545],
  ["FL", "Florida", 21538187], ["GA", "Georgia", 10711908], ["HI", "Hawaii", 1455271],
  ["ID", "Idaho", 1839106], ["IL", "Illinois", 12812508], ["IN", "Indiana", 6785528],
  ["IA", "Iowa", 3190369], ["KS", "Kansas", 2937880], ["KY", "Kentucky", 4505836],
  ["LA", "Louisiana", 4657757], ["ME", "Maine", 1362359], ["MD", "Maryland", 6177224],
  ["MA", "Massachusetts", 7029917], ["MI", "Michigan", 10037261], ["MN", "Minnesota", 5706494],
  ["MS", "Mississippi", 2961279], ["MO", "Missouri", 6154913], ["MT", "Montana", 1084225],
  ["NE", "Nebraska", 1961504], ["NV", "Nevada", 3104614], ["NH", "New Hampshire", 1377529],
  ["NJ", "New Jersey", 9288994], ["NM", "New Mexico", 2117522], ["NY", "New York", 20201249],
  ["NC", "North Carolina", 10439388], ["ND", "North Dakota", 779094], ["OH", "Ohio", 11799448],
  ["OK", "Oklahoma", 3959353], ["OR", "Oregon", 4237256], ["PA", "Pennsylvania", 13002700],
  ["RI", "Rhode Island", 1097379], ["SC", "South Carolina", 5118425], ["SD", "South Dakota", 886667],
  ["TN", "Tennessee", 6910840], ["TX", "Texas", 29145505], ["UT", "Utah", 3271616],
  ["VT", "Vermont", 643077], ["VA", "Virginia", 8631393], ["WA", "Washington", 7614893],
  ["WV", "West Virginia", 1793716], ["WI", "Wisconsin", 5893718], ["WY", "Wyoming", 576851],
];

export const MOCK_GEO_STATES: GeoState[] = STATE_DATA.map(([id, name, pop]) =>
  buildState(id, name, pop),
);

export const MOCK_GEO_STATES_MAP = Object.fromEntries(
  MOCK_GEO_STATES.map((s) => [s.id, s]),
) as Record<string, GeoState>;

export function getGeoSummary() {
  const live = MOCK_GEO_STATES.filter((s) => s.status === "live").length;
  const review = MOCK_GEO_STATES.filter((s) => s.status === "under_review").length;
  const disabled = MOCK_GEO_STATES.filter((s) => s.status === "disabled").length;
  const totalPlayers = MOCK_GEO_STATES.reduce((sum, s) => sum + s.registeredPlayers, 0);
  const totalRevenue = MOCK_GEO_STATES.reduce((sum, s) => sum + s.revenue, 0);
  return { live, review, disabled, totalPlayers, totalRevenue };
}
