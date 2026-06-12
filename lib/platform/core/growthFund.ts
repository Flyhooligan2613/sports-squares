import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { logPlatformAudit } from "@/lib/platform/core/auditLog";

const TABLE = "platform_growth_fund_ledger";

export interface GrowthFundStats {
  balanceCents: number;
  lifetimeContributionsCents: number;
  monthlyContributionsCents: number;
}

export async function creditGrowthFund(input: {
  amountCents: number;
  sourceType: string;
  sourceId?: string;
  description: string;
}): Promise<void> {
  if (input.amountCents <= 0) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(TABLE).insert({
    amount_cents: input.amountCents,
    direction: "credit",
    source_type: input.sourceType,
    source_id: input.sourceId ?? null,
    description: input.description,
  });

  if (error) throw error;

  await logPlatformAudit({
    eventType: "payout.growth_fund",
    summary: `Growth Fund +${input.amountCents}¢ — ${input.description}`,
    entityType: input.sourceType,
    entityId: input.sourceId,
    metadata: { amountCents: input.amountCents },
  });
}

export async function getGrowthFundStats(): Promise<GrowthFundStats> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("amount_cents, direction, created_at");

  if (error) throw error;

  let balanceCents = 0;
  let lifetimeContributionsCents = 0;
  let monthlyContributionsCents = 0;

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  for (const row of data ?? []) {
    const amount = row.amount_cents as number;
    const signed = row.direction === "debit" ? -amount : amount;
    balanceCents += signed;

    if (row.direction === "credit") {
      lifetimeContributionsCents += amount;
      if (new Date(row.created_at as string) >= monthStart) {
        monthlyContributionsCents += amount;
      }
    }
  }

  return { balanceCents, lifetimeContributionsCents, monthlyContributionsCents };
}

export const GROWTH_FUND_PURPOSES = [
  "Weekly promotions",
  "Free entries",
  "Community giveaways",
  "Progressive jackpots",
  "Platform improvements",
  "Future player incentives",
] as const;

export const GROWTH_FUND_TRANSPARENCY =
  "When a platform-owned square wins, winnings are never paid to an administrator. They are routed into the Platform Growth Fund to support community promotions and platform improvements.";
