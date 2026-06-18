import { getSmartRecommendations } from "@/lib/platform/engines/payment/wallet/SmartWalletService";
import {
  computeTotalSpendableCents,
  computeWithdrawableCents,
  getWalletBalances,
} from "@/lib/platform/engines/payment/wallet/WalletLedgerService";
import { canAffordEntry } from "@/lib/platform/engines/payment/wallet/ContestFundingService";
import { ALIVE_BRAND } from "@/lib/platform/language/aliveLanguage";
import type { SmartWalletInsight } from "./types";

const DEFAULT_ENTRY_CENTS = 2500;

export async function fetchSmartWalletInsights(
  email: string
): Promise<SmartWalletInsight[]> {
  const [baseRecs, { balances }, afford] = await Promise.all([
    getSmartRecommendations(email),
    getWalletBalances(email).catch(() => ({
      balances: {
        available: 0,
        pendingWinnings: 0,
        pendingWithdrawals: 0,
        contestCredits: 0,
        bonusCredits: 0,
        rewardCredits: 0,
        promotional: 0,
        referral: 0,
      },
    })),
    canAffordEntry(email, DEFAULT_ENTRY_CENTS).catch(() => ({
      canAfford: false,
      shortfallCents: DEFAULT_ENTRY_CENTS,
    })),
  ]);

  const insights: SmartWalletInsight[] = baseRecs.map((rec) => ({
    id: rec.id,
    kind: rec.kind,
    title: rec.title,
    body: rec.body,
    ctaLabel: rec.ctaLabel,
    ctaHref: rec.ctaHref,
    priority: rec.priority,
    source: "real",
  }));

  const spendable = computeTotalSpendableCents(balances);
  const withdrawable = computeWithdrawableCents(balances);
  const contestsAffordable = Math.floor(spendable / DEFAULT_ENTRY_CENTS);

  if (contestsAffordable >= 2) {
    insights.push({
      id: "multi_entry",
      kind: "contest_affordance",
      title: `Enter ${contestsAffordable} contests today`,
      body: `Your ${ALIVE_BRAND.squareWallet} balance covers multiple entries — stack your Legacy™.`,
      ctaLabel: "Contest Center",
      ctaHref: "/contest-center",
      priority: 75,
      source: "real",
    });
  }

  if (withdrawable >= 2500) {
    insights.push({
      id: "withdrawable_balance",
      kind: "withdrawable",
      title: "Withdrawable balance ready",
      body: `$${(withdrawable / 100).toFixed(2)} available to cash out via ${ALIVE_BRAND.squareBank}.`,
      ctaLabel: "Withdraw",
      ctaHref: "/my-games/wallet?tab=withdraw",
      priority: 60,
      source: "real",
    });
  }

  if (balances.promotional > 0 || balances.bonusCredits > 0) {
    insights.push({
      id: "credits_expiring",
      kind: "expiring_credits",
      title: "Credits ready to use",
      body: "Promotional credits apply first at checkout — join before they expire.",
      ctaLabel: "View Credits",
      ctaHref: "/my-games/rewards/credits",
      priority: 85,
      source: "real",
    });
  }

  if (!afford.canAfford && afford.shortfallCents > 0 && afford.shortfallCents <= DEFAULT_ENTRY_CENTS) {
    insights.push({
      id: "one_contest_away",
      kind: "reward_near",
      title: "One contest away",
      body: `Add $${(afford.shortfallCents / 100).toFixed(2)} to unlock your next competition.`,
      ctaLabel: "Add Funds",
      ctaHref: `/my-games/wallet?deposit=${afford.shortfallCents}`,
      priority: 95,
      source: "real",
    });
  }

  return insights
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);
}
