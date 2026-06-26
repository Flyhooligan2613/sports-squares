import Link from "next/link";
import AdminStatCard from "@/components/admin/AdminStatCard";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import {
  AlertTriangle,
  DollarSign,
  Gauge,
  Gift,
  MessageSquare,
  Percent,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import type { CommandCenterDashboardStats, SystemHealthStatus } from "@/lib/platform/engines/commandCenter";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const HEALTH_LABEL: Record<SystemHealthStatus, string> = {
  healthy: "All systems operational",
  degraded: "Degraded — review health",
  critical: "Critical — action required",
};

const HEALTH_ACCENT: Record<SystemHealthStatus, "success" | "gold" | "purple"> = {
  healthy: "success",
  degraded: "gold",
  critical: "purple",
};

interface DashboardStatGridProps {
  stats: CommandCenterDashboardStats;
}

export default function DashboardStatGrid({ stats }: DashboardStatGridProps) {
  return (
    <div className="space-y-6">
      <LandingGlassCard className="p-4 sm:p-5 sb-card-lift">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={[
                "w-2.5 h-2.5 rounded-full shrink-0",
                stats.systemHealthStatus === "healthy"
                  ? "bg-sb-success animate-pulse"
                  : stats.systemHealthStatus === "degraded"
                    ? "bg-amber-400"
                    : "bg-red-400 animate-pulse",
              ].join(" ")}
            />
            <div>
              <p className="text-sm font-semibold text-white">Platform Status</p>
              <p className="text-xs text-sb-muted">{HEALTH_LABEL[stats.systemHealthStatus]}</p>
            </div>
          </div>
          <Link
            href="/admin/command-center/health"
            className="text-sm text-sb-glow hover:text-white transition-colors"
          >
            System Health →
          </Link>
        </div>
      </LandingGlassCard>

      <div>
        <h2 className="text-xs uppercase tracking-[0.18em] font-semibold text-sb-muted mb-3">
          Operations — needs attention
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4">
          <Link href="/admin/command-center/support" className="block sb-card-lift rounded-2xl">
            <AdminStatCard
              label="Open Tickets"
              value={stats.openSupportTickets}
              icon={MessageSquare}
              accent={stats.openSupportTickets > 0 ? "gold" : "success"}
              delay={0}
            />
          </Link>
          <Link href="/admin/command-center/payments" className="block sb-card-lift rounded-2xl">
            <AdminStatCard
              label="Pending Withdrawals"
              value={stats.pendingWithdrawals}
              icon={Wallet}
              accent={stats.pendingWithdrawals > 0 ? "gold" : "muted"}
              delay={40}
            />
          </Link>
          <Link href="/admin/command-center/payments" className="block sb-card-lift rounded-2xl">
            <AdminStatCard
              label="Withdrawal Holds"
              value={stats.pendingWithdrawalHolds}
              icon={Wallet}
              accent={stats.pendingWithdrawalHolds > 0 ? "purple" : "muted"}
              delay={80}
            />
          </Link>
          <Link href="/admin/command-center/compliance" className="block sb-card-lift rounded-2xl">
            <AdminStatCard
              label="Pending KYC"
              value={stats.pendingVerifications}
              icon={ShieldCheck}
              accent={stats.pendingVerifications > 0 ? "gold" : "success"}
              delay={120}
            />
          </Link>
          <Link href="/admin/command-center/alerts" className="block sb-card-lift rounded-2xl">
            <AdminStatCard
              label="Active Alerts"
              value={stats.platformAlertsTriggered}
              icon={AlertTriangle}
              accent={stats.platformAlertsTriggered > 0 ? "purple" : "success"}
              delay={160}
            />
          </Link>
          <Link href="/admin/command-center/contests" className="block sb-card-lift rounded-2xl">
            <AdminStatCard
              label="Active Contests"
              value={stats.activeContests}
              icon={Trophy}
              accent="purple"
              delay={200}
            />
          </Link>
          <Link href="/admin/command-center/contests" className="block sb-card-lift rounded-2xl">
            <AdminStatCard
              label="Entries Today"
              value={stats.contestEntriesToday}
              icon={Trophy}
              accent="success"
              delay={240}
            />
          </Link>
          <Link href="/admin/command-center/players" className="block sb-card-lift rounded-2xl">
            <AdminStatCard
              label="New Registrations"
              value={stats.newRegistrationsToday}
              icon={UserPlus}
              accent="success"
              delay={280}
            />
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-xs uppercase tracking-[0.18em] font-semibold text-sb-muted mb-3">
          Platform pulse
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          <AdminStatCard
            label="Competitors Online"
            value={stats.competitorsOnline}
            icon={Users}
            accent="success"
            delay={0}
          />
          <AdminStatCard
            label="Prize Pools"
            value={formatCents(stats.prizePoolCents)}
            icon={DollarSign}
            accent="gold"
            delay={40}
          />
          <AdminStatCard
            label="Deposits Today"
            value={formatCents(stats.depositsTodayCents)}
            icon={Wallet}
            accent="success"
            delay={80}
          />
          <AdminStatCard
            label="Withdrawals Today"
            value={formatCents(stats.withdrawalsTodayCents)}
            icon={Wallet}
            accent="muted"
            delay={120}
          />
          <AdminStatCard
            label="Contest Fill Rate"
            value={`${stats.contestFillRatePercent}%`}
            icon={Percent}
            accent="purple"
            delay={160}
          />
          <AdminStatCard
            label="Reward Drops"
            value={stats.rewardDropsToday}
            icon={Gift}
            accent="gold"
            delay={200}
          />
          <AdminStatCard
            label="Highlight Squares"
            value={stats.highlightSquaresActive}
            icon={Sparkles}
            accent="purple"
            delay={240}
          />
          <AdminStatCard
            label="Champions Today"
            value={stats.championsToday}
            icon={Trophy}
            accent="gold"
            delay={280}
          />
          <AdminStatCard
            label="System Health"
            value={stats.systemHealthStatus}
            icon={Gauge}
            accent={HEALTH_ACCENT[stats.systemHealthStatus]}
            delay={320}
          />
        </div>
      </div>
    </div>
  );
}
