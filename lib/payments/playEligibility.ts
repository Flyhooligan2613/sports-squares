import { getPlayerConnectStatus } from "@/lib/database/services/stripeConnect";
import { getPlayerWallet } from "@/lib/stripe/playerWallet";
import { normalizeEmail } from "@/lib/player/statsCore";

export type PlayEligibilityBlocker = "sign_in_required" | "payout_account_required";

export interface PlayEligibilityStatus {
  eligible: boolean;
  canStartCheckout: boolean;
  blockers: PlayEligibilityBlocker[];
  payoutsReady: boolean;
  depositCardOnFile: boolean;
  savedPaymentLabel: string | null;
  setupUrl: string;
}

/** Play requires a completed Stripe Connect cash-out account. Stripe handles card and identity checks. */
export async function getPlayEligibility(email: string): Promise<PlayEligibilityStatus> {
  const normalized = normalizeEmail(email);
  const blockers: PlayEligibilityBlocker[] = [];

  const [connect, wallet] = await Promise.all([
    getPlayerConnectStatus(normalized),
    getPlayerWallet(normalized),
  ]);

  const payoutsReady = connect.ready;
  const depositCardOnFile = Boolean(wallet.defaultPaymentMethodId);

  if (!payoutsReady) blockers.push("payout_account_required");

  const savedPaymentLabel =
    wallet.last4 && wallet.brand
      ? `${wallet.brand.charAt(0).toUpperCase()}${wallet.brand.slice(1)} ···· ${wallet.last4}`
      : null;

  return {
    eligible: payoutsReady,
    canStartCheckout: payoutsReady,
    blockers,
    payoutsReady,
    depositCardOnFile,
    savedPaymentLabel,
    setupUrl: "/my-games/winnings",
  };
}

export function playEligibilityErrorMessage(blockers: PlayEligibilityBlocker[]): string {
  if (blockers.includes("payout_account_required")) {
    return "Set up your cash-out account through Stripe on My Winnings before placing squares or picks.";
  }
  return "Complete cash-out setup before playing.";
}
