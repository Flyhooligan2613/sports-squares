import type {
  EspnSport,
  InviteDeliveryStatus,
  PaymentStatus,
  PayoutPercentages,
  PayoutStatus,
  PayoutTemplate,
  PoolStatus,
  PurchaseSource,
  ScoringPeriod,
  SmsDeliveryStatus,
} from "@/lib/types";

export interface PoolRow {
  id: string;
  name: string;
  home_team: string;
  away_team: string;
  invite_code: string;
  status: PoolStatus;
  top_numbers: number[] | null;
  side_numbers: number[] | null;
  espn_game_id: string | null;
  espn_sport: EspnSport;
  cost_per_square: number;
  service_fee_percent: number;
  payout_template: PayoutTemplate;
  payout_percentages: PayoutPercentages;
  created_at: string;
}

export interface PlayerRow {
  id: string;
  pool_id: string;
  name: string;
  credits_allocated: number;
  credits_used: number;
  initials: string;
  color: string | null;
  invite_token: string | null;
  amount_paid: number;
  payment_status: PaymentStatus;
  email: string | null;
  phone: string | null;
  invite_delivery_status: InviteDeliveryStatus;
  invite_sent_at: string | null;
  invite_delivery_error: string | null;
  sms_delivery_status: SmsDeliveryStatus;
  purchase_source: PurchaseSource;
  stripe_checkout_session_id: string | null;
  created_at: string;
}

export interface SquareRow {
  id: string;
  pool_id: string;
  square_number: number;
  player_id: string | null;
  claimed: boolean;
  row_digit: number | null;
  column_digit: number | null;
}

export interface WinnerRow {
  id: string;
  pool_id: string;
  quarter: ScoringPeriod;
  winning_square: number;
  winning_player: string;
  home_score: number;
  away_score: number;
  payout_amount: number | null;
  payout_status: PayoutStatus;
  created_at: string;
}

export interface DatabaseCounts {
  pools: number;
  players: number;
  squares: number;
  winners: number;
}
