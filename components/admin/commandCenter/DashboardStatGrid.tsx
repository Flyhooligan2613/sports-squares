import AdminStatCard from "@/components/admin/AdminStatCard";
import {
  DollarSign,
  Gift,
  Percent,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import type { CommandCenterDashboardStats } from "@/lib/platform/engines/commandCenter";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

interface DashboardStatGridProps {
  stats: CommandCenterDashboardStats;
}

export default function DashboardStatGrid({ stats }: DashboardStatGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
      <AdminStatCard
        label="Competitors Online"
        value={stats.competitorsOnline}
        icon={Users}
        accent="success"
        delay={0}
      />
      <AdminStatCard
        label="Active Contests"
        value={stats.activeContests}
        icon={Trophy}
        accent="purple"
        delay={40}
      />
      <AdminStatCard
        label="Prize Pools"
        value={formatCents(stats.prizePoolCents)}
        icon={DollarSign}
        accent="gold"
        delay={80}
      />
      <AdminStatCard
        label="Deposits Today"
        value={formatCents(stats.depositsTodayCents)}
        icon={Wallet}
        accent="success"
        delay={120}
      />
      <AdminStatCard
        label="Withdrawals Today"
        value={formatCents(stats.withdrawalsTodayCents)}
        icon={Wallet}
        accent="muted"
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
        label="New Registrations"
        value={stats.newRegistrationsToday}
        icon={UserPlus}
        accent="success"
        delay={320}
      />
      <AdminStatCard
        label="Contest Fill Rate"
        value={`${stats.contestFillRatePercent}%`}
        icon={Percent}
        accent="purple"
        delay={360}
      />
    </div>
  );
}
