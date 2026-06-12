import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function estimatePoolPrizeCents(poolId: string): Promise<number> {
  const supabase = getSupabaseAdmin();

  const [poolRes, playersRes] = await Promise.all([
    supabase
      .from(TABLES.pools)
      .select("cost_per_square, service_fee_percent")
      .eq("id", poolId)
      .maybeSingle(),
    supabase
      .from(TABLES.players)
      .select("credits_allocated")
      .eq("pool_id", poolId),
  ]);

  if (poolRes.error) throw poolRes.error;
  if (playersRes.error) throw playersRes.error;
  if (!poolRes.data) return 0;

  const cost = Number(poolRes.data.cost_per_square ?? 0);
  const feePercent = Number(poolRes.data.service_fee_percent ?? 0);
  const credits = (playersRes.data ?? []).reduce(
    (sum, row) => sum + Number(row.credits_allocated ?? 0),
    0
  );

  const revenue = credits * cost;
  const fee = revenue * (feePercent / 100);
  return Math.round((revenue - fee) * 100);
}

export function formatPrizePool(cents: number): string {
  if (cents <= 0) return "—";
  return `$${Math.round(cents / 100).toLocaleString()}`;
}
