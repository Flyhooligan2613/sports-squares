import { getInventorySummary } from "@/lib/platform/ecosystem/inventory";
import { canAffordEntry } from "./ContestFundingService";
import {
  computeTotalSpendableCents,
  computeWithdrawableCents,
  getWalletBalances,
} from "./WalletLedgerService";
import type { SmartWalletRecommendation } from "./types";

const DEFAULT_ENTRY_CENTS = 2500;

export async function getSmartRecommendations(
  email: string,
  context?: { suggestedEntryCents?: number }
): Promise<SmartWalletRecommendation[]> {
  const entryCents = context?.suggestedEntryCents ?? DEFAULT_ENTRY_CENTS;
  const [{ balances }, afford, inventory] = await Promise.all([
    getWalletBalances(email),
    canAffordEntry(email, entryCents),
    getInventorySummary(email).catch(() => null),
  ]);

  const recs: SmartWalletRecommendation[] = [];
  const spendable = computeTotalSpendableCents(balances);
  const withdrawable = computeWithdrawableCents(balances);

  if (!afford.canAfford && afford.shortfallCents > 0) {
    recs.push({
      id: "add_funds",
      kind: "add_funds",
      title: "Top up to join the next contest",
      body: `Add $${(afford.shortfallCents / 100).toFixed(2)} to SquareWallet™ to cover your next entry.`,
      ctaLabel: "Add Funds",
      ctaHref: `/my-games/wallet?deposit=${afford.shortfallCents}`,
      priority: 100,
    });
  } else if (spendable >= entryCents) {
    recs.push({
      id: "contest_affordance",
      kind: "contest_affordance",
      title: "You're funded for competition",
      body: `Your SquareWallet covers at least one $${(entryCents / 100).toFixed(0)} contest entry.`,
      ctaLabel: "Browse Contests",
      ctaHref: "/contest-center",
      priority: 80,
    });
  }

  const promoCredits = inventory?.counts.promo_credit ?? 0;
  if (promoCredits > 0 || balances.promotional > 0) {
    recs.push({
      id: "expiring_credits",
      kind: "expiring_credits",
      title: "Use your platform credits",
      body: "Promotional credits apply first at checkout — don't let them sit unused.",
      ctaLabel: "View Credits",
      ctaHref: "/my-games/rewards/credits",
      priority: 70,
    });
  }

  if (withdrawable >= 5000) {
    recs.push({
      id: "mystery_pass",
      kind: "mystery_pass",
      title: "Mystery SquarePass opportunity",
      body: "Competitors with active balances unlock exclusive SquarePass rewards.",
      ctaLabel: "Open SquarePass",
      ctaHref: "/my-games/square-pass",
      priority: 50,
    });
  }

  return recs.sort((a, b) => b.priority - a.priority);
}
