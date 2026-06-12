import PageHeader from "@/components/ui/PageHeader";
import AdminStatCard from "@/components/admin/AdminStatCard";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { STRIPE_FINANCIAL_AUTHORITY } from "@/lib/platform/core/adminPolicy";
import {
  getFinancialStatusOverview,
  listRecentPayouts,
} from "@/lib/platform/core/financialStatus";
import { getGrowthFundStats } from "@/lib/platform/core/growthFund";
import { Activity, CheckCircle2, Clock, Webhook, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const styles =
    normalized === "completed" || normalized === "paid"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : normalized === "failed"
        ? "bg-red-500/15 text-red-300 border-red-500/30"
        : normalized === "queued" || normalized === "processing"
          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
          : "bg-white/5 text-sb-muted border-white/10";

  return (
    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${styles}`}>
      {status}
    </span>
  );
}

export default async function AdminFinancialPage() {
  let overview = null;
  let recent: Awaited<ReturnType<typeof listRecentPayouts>> = [];
  let growthFund = { balanceCents: 0, lifetimeContributionsCents: 0, monthlyContributionsCents: 0 };

  try {
    [overview, recent, growthFund] = await Promise.all([
      getFinancialStatusOverview(),
      listRecentPayouts(30),
      getGrowthFundStats(),
    ]);
  } catch {
    // Tables may not exist until migration 023 is applied.
  }

  const squares = overview?.squaresPayouts ?? { pending: 0, completed: 0, failed: 0, queued: 0 };
  const pickem = overview?.pickemPayouts ?? { pending: 0, completed: 0, failed: 0, queued: 0 };

  return (
    <div className="max-w-5xl space-y-8">
      <PageHeader
        title="Financial Status"
        subtitle="Read-only monitoring — Stripe controls all payments and payouts."
      />

      <LandingGlassCard className="p-5 border border-amber-500/20">
        <p className="text-sm text-sb-muted leading-relaxed">{STRIPE_FINANCIAL_AUTHORITY}</p>
        <p className="text-xs text-sb-muted mt-2">
          No manual payout, refund, or transfer actions are available in this console.
        </p>
      </LandingGlassCard>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard label="Squares Queued" value={squares.queued} icon={Clock} accent="gold" />
        <AdminStatCard label="Squares Completed" value={squares.completed} icon={CheckCircle2} accent="success" />
        <AdminStatCard label="Squares Failed" value={squares.failed} icon={XCircle} />
        <AdminStatCard label="Squares Pending" value={squares.pending} icon={Activity} accent="purple" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard label="Pick'em Queued" value={pickem.queued} icon={Clock} accent="gold" />
        <AdminStatCard label="Pick'em Completed" value={pickem.completed} icon={CheckCircle2} accent="success" />
        <AdminStatCard label="Pick'em Failed" value={pickem.failed} icon={XCircle} />
        <AdminStatCard label="Pick'em Pending" value={pickem.pending} icon={Activity} accent="purple" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <LandingGlassCard className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Webhook className="w-4 h-4 text-sb-glow" />
            <p className="text-xs uppercase tracking-wider text-sb-muted">Stripe Webhooks (24h)</p>
          </div>
          <p className="text-2xl font-bold text-white">{overview?.webhookEvents.total24h ?? 0}</p>
          <p className="text-xs text-sb-muted mt-1">
            Last received:{" "}
            {overview?.webhookEvents.lastReceivedAt
              ? formatDate(overview.webhookEvents.lastReceivedAt)
              : "—"}
          </p>
        </LandingGlassCard>
        <LandingGlassCard className="p-5">
          <p className="text-xs uppercase tracking-wider text-sb-muted mb-2">Growth Fund</p>
          <p className="text-2xl font-bold text-emerald-400">{formatMoney(growthFund.balanceCents)}</p>
          <p className="text-xs text-sb-muted mt-1">
            +{formatMoney(growthFund.monthlyContributionsCents)} this month
          </p>
        </LandingGlassCard>
        <LandingGlassCard className="p-5">
          <p className="text-xs uppercase tracking-wider text-sb-muted mb-2">Automation</p>
          <p className="text-sm text-white">
            {overview?.automation.poolsOpen ?? 0} open boards ·{" "}
            {overview?.automation.pickemContestsActive ?? 0} active Pick&apos;em weeks
          </p>
        </LandingGlassCard>
      </div>

      <div>
        <h2 className="text-white font-semibold text-lg mb-4">Recent Payout Activity</h2>
        {recent.length === 0 ? (
          <LandingGlassCard className="p-6 text-center text-sb-muted text-sm">
            No payout records yet, or migration 023 tables are pending.
          </LandingGlassCard>
        ) : (
          <div className="space-y-2">
            {recent.map((row) => (
              <LandingGlassCard key={`${row.gameType}-${row.id}`} className="p-4 flex flex-wrap items-center gap-3 justify-between">
                <div>
                  <p className="text-sm text-white font-medium">
                    {row.gameType === "squares" ? "SquareBoards" : "Pick'em"} · {row.recipient}
                  </p>
                  <p className="text-xs text-sb-muted mt-0.5">{formatDate(row.updatedAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">{formatMoney(row.amountCents)}</span>
                  <StatusPill status={row.status} />
                  {row.attempts > 0 && (
                    <span className="text-[10px] text-sb-muted">
                      Retry {row.attempts}/{row.maxAttempts}
                    </span>
                  )}
                </div>
                {row.lastError ? (
                  <p className="w-full text-xs text-red-400/80 truncate">{row.lastError}</p>
                ) : null}
              </LandingGlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
