export type PoolStatus =
  | "open"
  | "locked"
  | "numbers-drawn"
  | "completed"
  | "archived";

export interface AdminStats {
  totalPools: number;
  activePools: number;
  completedPools: number;
  totalPlayers: number;
}

export type ScoringPeriod =
  | "Q1"
  | "Q2"
  | "Q3"
  | "Q4"
  | "1H"
  | "2H"
  | "FINAL";

/** @deprecated Use ScoringPeriod — kept for compatibility */
export type Quarter = ScoringPeriod;

export const QUARTERS: ScoringPeriod[] = ["Q1", "Q2", "Q3", "Q4", "FINAL"];

export type EspnSport = "nfl" | "ncaaf" | "nba" | "ncaab";

export type PaymentStatus = "paid" | "unpaid" | "partial";
export type PayoutStatus = "pending" | "paid" | "unpaid";
export type InviteDeliveryStatus = "pending" | "sent" | "failed" | "skipped";
export type SmsDeliveryStatus = "pending" | "sent" | "failed" | "skipped";
export type PurchaseSource = "manual" | "stripe";

export type PayoutTemplate = "equal" | "standard" | "heavy_final" | "custom";

export type PayoutPercentages = Partial<Record<ScoringPeriod, number>>;

export interface Participant {
  id: string;
  name: string;
  initials: string;
  color?: string;
  inviteToken?: string;
  creditsPurchased: number;
  creditsUsed: number;
  creditsRemaining: number;
  amountDue?: number;
  amountPaid?: number;
  paymentStatus?: PaymentStatus;
  email?: string;
  phone?: string;
  inviteDeliveryStatus?: InviteDeliveryStatus;
  inviteSentAt?: string;
  inviteDeliveryError?: string;
  smsDeliveryStatus?: SmsDeliveryStatus;
  purchaseSource?: PurchaseSource;
  stripeCheckoutSessionId?: string;
}

export interface PlayerContactInput {
  email?: string;
  phone?: string;
}

export interface PoolSummary {
  allocatedCredits: number;
  totalRevenue: number;
  serviceFee: number;
  prizePool: number;
}

export interface PlayerInviteInfo {
  player: Participant;
  poolId: string;
  poolName: string;
  homeTeam: string;
  awayTeam: string;
  poolStatus: PoolStatus;
}

export type ClaimResult =
  | { ok: true; pool: Pool }
  | { ok: false; error: string };

export interface Square {
  id: number;
  claimed: boolean;
  owner?: Participant;
}

export interface BoardSquare extends Square {
  selected: boolean;
}

export interface WinnerResult {
  quarter: ScoringPeriod;
  homeScore: number;
  awayScore: number;
  homeDigit: number;
  awayDigit: number;
  squareId: number;
  ownerName: string;
  ownerInitials?: string;
  ownerColor?: string;
  recordedAt?: string;
  payoutAmount?: number | null;
  payoutStatus?: PayoutStatus;
}

export type WinnerHistory = Partial<Record<ScoringPeriod, WinnerResult>>;

export interface Pool {
  id: string;
  name: string;
  homeTeam: string;
  awayTeam: string;
  inviteCode: string;
  status: PoolStatus;
  espnGameId?: string;
  espnSport?: EspnSport;
  participants: Participant[];
  squares: Square[];
  topNumbers?: number[];
  sideNumbers?: number[];
  costPerSquare?: number;
  serviceFeePercent?: number;
  payoutTemplate?: PayoutTemplate;
  payoutPercentages?: PayoutPercentages;
}

export interface EspnScoreboardGame {
  id: string;
  name: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string;
  period: number;
}

export interface EspnLiveGame {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeLineScores: number[];
  awayLineScores: number[];
  period: number;
  gameCompleted: boolean;
  statusDetail: string;
}
