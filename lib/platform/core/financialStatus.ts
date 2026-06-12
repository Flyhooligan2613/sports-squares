import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface FinancialStatusOverview {
  squaresPayouts: {
    pending: number;
    completed: number;
    failed: number;
    queued: number;
  };
  pickemPayouts: {
    pending: number;
    completed: number;
    failed: number;
    queued: number;
  };
  webhookEvents: {
    total24h: number;
    failed24h: number;
    lastReceivedAt: string | null;
  };
  automation: {
    pickemContestsOpen: number;
    pickemContestsActive: number;
    poolsOpen: number;
  };
}

export interface RecentPayoutRow {
  id: string;
  gameType: "squares" | "pickem";
  status: string;
  amountCents: number;
  recipient: string;
  attempts: number;
  maxAttempts: number;
  lastError: string | null;
  updatedAt: string;
}

export async function getFinancialStatusOverview(): Promise<FinancialStatusOverview> {
  const supabase = getSupabaseAdmin();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    payoutJobsRes,
    pickemPayoutsRes,
    webhooksRes,
    pickemOpenRes,
    pickemActiveRes,
    poolsOpenRes,
  ] = await Promise.all([
    supabase.from("payout_jobs").select("status"),
    supabase.from("pickem_payouts").select("status"),
    supabase
      .from("stripe_webhook_events")
      .select("processed_at, event_type")
      .gte("processed_at", since24h)
      .order("processed_at", { ascending: false })
      .limit(500),
    supabase
      .from("pickem_contests")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("pickem_contests")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("pools")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
  ]);

  const countByStatus = (rows: { status: string }[] | null) => {
    const out = { pending: 0, completed: 0, failed: 0, queued: 0 };
    for (const row of rows ?? []) {
      const s = row.status;
      if (s === "completed" || s === "paid") out.completed += 1;
      else if (s === "failed") out.failed += 1;
      else if (s === "queued" || s === "processing") out.queued += 1;
      else out.pending += 1;
    }
    return out;
  };

  const webhookRows = webhooksRes.data ?? [];

  return {
    squaresPayouts: countByStatus(payoutJobsRes.data as { status: string }[] | null),
    pickemPayouts: countByStatus(pickemPayoutsRes.data as { status: string }[] | null),
    webhookEvents: {
      total24h: webhookRows.length,
      failed24h: 0,
      lastReceivedAt: (webhookRows[0]?.processed_at as string | undefined) ?? null,
    },
    automation: {
      pickemContestsOpen: pickemOpenRes.count ?? 0,
      pickemContestsActive: pickemActiveRes.count ?? 0,
      poolsOpen: poolsOpenRes.count ?? 0,
    },
  };
}

export async function listRecentPayouts(limit = 25): Promise<RecentPayoutRow[]> {
  const supabase = getSupabaseAdmin();

  const [jobsRes, pickemRes] = await Promise.all([
    supabase
      .from("payout_jobs")
      .select(
        "id, status, amount_cents, winning_player, attempts, max_attempts, last_error, updated_at"
      )
      .order("updated_at", { ascending: false })
      .limit(limit),
    supabase
      .from("pickem_payouts")
      .select("id, status, amount_cents, email, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit),
  ]);

  const squaresRows: RecentPayoutRow[] = (jobsRes.data ?? []).map((row) => ({
    id: row.id as string,
    gameType: "squares" as const,
    status: row.status as string,
    amountCents: row.amount_cents as number,
    recipient: row.winning_player as string,
    attempts: row.attempts as number,
    maxAttempts: row.max_attempts as number,
    lastError: (row.last_error as string | null) ?? null,
    updatedAt: row.updated_at as string,
  }));

  const pickemRows: RecentPayoutRow[] = (pickemRes.data ?? []).map((row) => ({
    id: row.id as string,
    gameType: "pickem" as const,
    status: row.status as string,
    amountCents: row.amount_cents as number,
    recipient: row.email as string,
    attempts: 0,
    maxAttempts: 5,
    lastError: null,
    updatedAt: row.updated_at as string,
  }));

  return [...squaresRows, ...pickemRows]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}
