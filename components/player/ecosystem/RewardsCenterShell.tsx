"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { RewardsCenterProvider, useRewardsCenter } from "./RewardsCenterProvider";

const TABS: { href: string; label: string; icon: string; exact?: boolean }[] = [
  { href: "/my-games/rewards", label: "Dashboard", icon: "📊", exact: true },
  { href: "/my-games/rewards/tier", label: "Tier Progress", icon: "⭐" },
  { href: "/my-games/rewards/marketplace", label: "Marketplace", icon: "🛒" },
  { href: "/my-games/rewards/inventory", label: "Inventory", icon: "🎒" },
  { href: "/my-games/rewards/mystery-box", label: "Weekly Drop", icon: "🎁" },
  { href: "/my-games/rewards/promotions", label: "Promotions", icon: "🎁" },
  { href: "/my-games/rewards/credits", label: "My Credits", icon: "💎" },
  { href: "/my-games/rewards/history", label: "History", icon: "📜" },
];

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, loading } = useRewardsCenter();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
      <PageHeader
        title="🎁 Rewards"
        subtitle="Earn, unlock, and redeem across every SquareBoards game."
      />

      {!loading && data ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
          <StatPill label="Credits" value={data.wallet.tierCredits.toLocaleString()} />
          <StatPill label="This week" value={data.wallet.weeklyTierCredits.toLocaleString()} />
          <StatPill label="Lifetime" value={data.wallet.lifetimeTierCredits.toLocaleString()} />
          <StatPill label="Pending" value={String(data.wallet.pendingRewards)} />
          <StatPill
            label="Square $"
            value={`$${(data.wallet.squareCreditsCents / 100).toFixed(0)}`}
          />
          <StatPill
            label="Pick'em $"
            value={`$${(data.wallet.pickemCreditsCents / 100).toFixed(0)}`}
          />
          <StatPill label="Mystery" value={String(data.wallet.mysteryBoxesAvailable)} />
          <StatPill label="Promos" value={String(data.promotions.filter((p) => !p.claimed).length)} />
        </div>
      ) : null}

      <nav
        className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-hide border-b border-white/10"
        aria-label="Rewards sections"
      >
        {TABS.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                "shrink-0 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                active
                  ? "bg-sb-purple/25 text-white border border-sb-purple/40"
                  : "text-sb-muted hover:text-white hover:bg-white/5",
              ].join(" ")}
            >
              <span className="mr-1" aria-hidden>
                {tab.icon}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-2 text-center">
      <p className="text-[9px] uppercase tracking-wider text-sb-muted truncate">{label}</p>
      <p className="text-sm font-bold text-white tabular-nums">{value}</p>
    </div>
  );
}

export default function RewardsCenterShell({ children }: { children: React.ReactNode }) {
  return (
    <RewardsCenterProvider>
      <ShellInner>{children}</ShellInner>
    </RewardsCenterProvider>
  );
}
