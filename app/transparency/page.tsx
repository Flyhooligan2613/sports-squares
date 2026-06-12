import Link from "next/link";
import PageShell from "@/components/ui/PageShell";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import PlatformTrustStrip from "@/components/platform/PlatformTrustStrip";
import { Button } from "@/components/ui/Button";
import { BRAND_NAME } from "@/lib/brand";
import {
  ADMIN_PHILOSOPHY,
  ADMIN_RESTRICTIONS,
  STRIPE_FINANCIAL_AUTHORITY,
} from "@/lib/platform/core/adminPolicy";
import {
  GROWTH_FUND_PURPOSES,
  GROWTH_FUND_TRANSPARENCY,
  getGrowthFundStats,
} from "@/lib/platform/core/growthFund";
import { GUARANTEED_PLAY_EXPLAINER } from "@/lib/platform/core/guaranteedPlay";
import { formatTierCents, PLATFORM_ENTRY_TIERS } from "@/lib/platform/core/entryTiers";

export const metadata = {
  title: `Transparency Center | ${BRAND_NAME}`,
  description: "How SquareBoards works — automation, payouts, and guaranteed play.",
};

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function TransparencyCenterPage() {
  let growthFund = { balanceCents: 0, lifetimeContributionsCents: 0, monthlyContributionsCents: 0 };
  try {
    growthFund = await getGrowthFundStats();
  } catch {
    // Migration may not be applied yet — show zeros.
  }

  const sections = [
    {
      title: "How SquareBoards Works",
      body: "SquareBoards is a fully automated multi-game sports platform. There are no commissioners, hosts, or moderators. You sign in, pick a game, make your picks or buy squares, and the platform handles everything else — locking, scoring, winners, and payouts.",
    },
    {
      title: "How Pick'em Works",
      body: "Every NFL week is created automatically. You choose winners before kickoff. Picks lock at kickoff, scores update from official feeds, and standings refresh in real time. Weekly winners receive automated Stripe payouts when the week completes.",
    },
    {
      title: "Automatic Payouts",
      body: "Winners never wait on a commissioner. When a quarter, final, or Pick'em week completes, SquareBoards queues a Stripe Connect transfer automatically. Retries run until the payout succeeds or the winner completes payout setup.",
    },
    {
      title: "Why Admins Cannot Alter Winners",
      body: ADMIN_PHILOSOPHY + " Administrators can monitor games and assist with technical issues, but they cannot edit scores, change winners, modify picks, or issue manual payouts.",
    },
    {
      title: "Official Sports Feeds",
      body: "Live scores and game results come from official league data (ESPN). Winner calculations run automatically from those feeds — no manual score entry.",
    },
    {
      title: "Stripe Secures Payments",
      body: STRIPE_FINANCIAL_AUTHORITY + " Your card payments and winner payouts are processed by Stripe, not stored on our servers.",
    },
    {
      title: "Guaranteed Boards",
      body: GUARANTEED_PLAY_EXPLAINER,
    },
    {
      title: "Platform-Owned Entries",
      body: GROWTH_FUND_TRANSPARENCY,
    },
  ];

  return (
    <PageShell title="Transparency Center" showLogo={false}>
      <p className="text-sb-muted text-sm text-center -mt-4 mb-8">Trust through automation</p>
      <PlatformTrustStrip className="mb-8" />

      <LandingSection variant="glow" className="py-0 mb-8">
        <div className="grid sm:grid-cols-3 gap-4">
          <LandingGlassCard className="p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-sb-muted mb-1">Growth Fund</p>
            <p className="text-2xl font-bold text-white">{formatMoney(growthFund.balanceCents)}</p>
          </LandingGlassCard>
          <LandingGlassCard className="p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-sb-muted mb-1">Lifetime</p>
            <p className="text-2xl font-bold text-white">
              {formatMoney(growthFund.lifetimeContributionsCents)}
            </p>
          </LandingGlassCard>
          <LandingGlassCard className="p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-sb-muted mb-1">This Month</p>
            <p className="text-2xl font-bold text-emerald-400">
              {formatMoney(growthFund.monthlyContributionsCents)}
            </p>
          </LandingGlassCard>
        </div>
        <p className="text-center text-sm text-sb-muted mt-4 max-w-2xl mx-auto">
          Growth Fund reserves: {GROWTH_FUND_PURPOSES.join(" · ")}
        </p>
      </LandingSection>

      <div className="space-y-4 not-prose mb-10">
        {sections.map((section) => (
          <LandingGlassCard key={section.title} className="p-6">
            <h2 className="text-white font-semibold text-lg mb-2">{section.title}</h2>
            <p className="text-sb-muted text-sm leading-relaxed">{section.body}</p>
          </LandingGlassCard>
        ))}
      </div>

      <LandingSectionHeader
        eyebrow="Entry levels"
        title="Play at your level"
        subtitle="Every game supports the same buy-in tiers — from $1 beginner boards to $100 premium contests."
      />
      <LandingGlassCard className="p-6 mb-8">
        <p className="text-sb-muted text-sm mb-4">
          Tiers from {formatTierCents(100)} through {formatTierCents(10000)}. Future games
          (Survivor, Brackets, Soccer, Baseball) inherit these automatically.
        </p>
        <div className="flex flex-wrap gap-2">
          {PLATFORM_ENTRY_TIERS.map((tier) => (
            <span
              key={tier.cents}
              className="px-3 py-1.5 rounded-full text-sm border border-white/10 text-white/90"
            >
              {tier.label}
            </span>
          ))}
        </div>
      </LandingGlassCard>

      <LandingGlassCard className="p-6 mb-8 border border-amber-500/20">
        <h2 className="text-white font-semibold mb-3">What administrators cannot do</h2>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm text-sb-muted">
          {ADMIN_RESTRICTIONS.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-red-400/80 shrink-0">×</span>
              {item}
            </li>
          ))}
        </ul>
      </LandingGlassCard>

      <div className="flex flex-wrap justify-center gap-3">
        <Button href="/pickem">Play Pick&apos;em</Button>
        <Button href="/games/nfl" variant="secondary">
          Play SquareBoards
        </Button>
        <Link href="/support" className="text-sm text-sb-glow hover:text-white self-center">
          Support Center →
        </Link>
      </div>
    </PageShell>
  );
}
