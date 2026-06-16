import { PLATFORM_TERMS } from "@/lib/platform/legacy/competitiveLanguage";
import { getPlayerConnectStatus } from "@/lib/database/services/stripeConnect";
import { getSquareWallet } from "@/lib/platform/engines/payment";
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
    getSquareWallet(normalized),
  ]);

  const payoutsReady = connect.ready;
  const depositCardOnFile = Boolean(wallet.defaultPaymentMethodId);

  if (!payoutsReady) blockers.push("payout_account_required");

  const savedPaymentLabel =
    wallet.paymentMethodLast4 && wallet.paymentMethodBrand
      ? `${wallet.paymentMethodBrand.charAt(0).toUpperCase()}${wallet.paymentMethodBrand.slice(1)} ···· ${wallet.paymentMethodLast4}`
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
    return `Set up your cash-out account through Stripe on ${PLATFORM_TERMS.contestWinnings} before entering contests.`;
  }
  return "Complete cash-out setup before playing.";
}
