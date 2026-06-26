"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AliveEmptyState from "@/components/alive/AliveEmptyState";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import PlayerTierCard from "@/components/player/ecosystem/PlayerTierCard";
import MysteryBoxModal from "@/components/player/ecosystem/MysteryBoxModal";
import RewardsProgressBar from "@/components/player/ecosystem/RewardsProgressBar";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";
import { SQUARE_DROP_NAME, SQUARE_DROP_READY } from "@/lib/platform/ecosystem/squareDropBrand";
import {
  evaluateAchievements,
} from "@/lib/platform/ecosystem/achievements/catalog";
import {
  buildProgressGoals,
  buildStreakSnapshot,
  resolveFeaturedAchievements,
  upcomingMilestones,
} from "@/lib/platform/ecosystem/progressionDisplay";
import {
  REWARDS_SECTIONS,
  getTierDisplayName,
} from "@/lib/platform/language/rewardsLanguage";
import { getTierVisual } from "@/lib/platform/ecosystem/tierVisuals";

export default function RewardsDashboardPanel() {
  const { data, loading, error, refresh } = useRewardsCenter();
  const [showBox, setShowBox] = useState(false);

  const derived = useMemo(() => {
    if (!data?.legacy) return null;
    const achievements = evaluateAchievements({
      legacy: {
        lifetimeWinnings: data.legacy.lifetimeWinnings,
        lifetimeWins: data.legacy.lifetimeWins,
        squaresWon: data.legacy.lifetimeWins,
        boardsPlayed: data.legacy.boardsPlayed,
        totalSquaresPurchased: data.legacy.totalSquares,
        seasonsPlayed: data.legacy.seasonsPlayed,
        yearsPlayed: data.legacy.seasonsPlayed,
        currentWinStreak: data.legacy.currentStreak,
        longestWinStreak: data.legacy.longestStreak,
      },
      mysteryBoxesOpened: data.legacy.mysteryBoxesOpened,
      qualifiedReferrals: data.referral.qualifiedReferrals,
      loginStreakDays: data.legacy.loginStreakDays,
      lifetimeTierCredits: data.dashboard.account.lifetimeTierCredits,
    });
    return {
      achievements,
      featured: resolveFeaturedAchievements(achievements),
      milestones: upcomingMilestones(achievements),
      progress: buildProgressGoals({
        weeklyTierCredits: data.wallet.weeklyTierCredits,
        creditHistory: data.creditHistory,
        lifetimeTierCredits: data.wallet.lifetimeTierCredits,
        tierProgressPct: data.dashboard.tierProgressPct,
        creditsToNextTier: data.dashboard.creditsToNextTier,
      }),
      streaks: buildStreakSnapshot({
        loginStreakDays: data.loginStreak,
        weeklyTierCredits: data.wallet.weeklyTierCredits,
        currentWinStreak: data.legacy.currentStreak,
      }),
    };
  }, [data]);

  const catalogByTier = useMemo(() => {
    if (!data) return { available: [], locked: [] };
    const currentSlug = data.dashboard.tier.slug;
    const tierOrder = [
      "rookie",
      "contender",
      "all-star",
      "champion",
      "elite",
      "legend",
      "hall-of-fame",
      "immortal",
    ];
    const currentIdx = tierOrder.indexOf(currentSlug);
    const available = data.catalog.filter((item) => {
      if (!item.minTierSlug) return true;
      return tierOrder.indexOf(item.minTierSlug) <= currentIdx;
    });
    const locked = data.catalog.filter((item) => {
      if (!item.minTierSlug) return false;
      return tierOrder.indexOf(item.minTierSlug) > currentIdx;
    });
    return { available: available.slice(0, 3), locked: locked.slice(0, 3) };
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-4 py-8">
        <div className="sb-xp-skeleton h-40 rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="sb-xp-skeleton h-24 rounded-xl" />
          <div className="sb-xp-skeleton h-24 rounded-xl" />
        </div>
        <BrandedLoadingLabel context="rewardDrop" className="text-center text-sb-muted" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <LandingGlassCard className="p-8 text-center">
        <p className="text-white font-semibold mb-2">Couldn&apos;t load rewards</p>
        <p className="text-sm text-sb-muted mb-6">{error ?? "Something went wrong."}</p>
        <Button variant="secondary" size="sm" onClick={() => void refresh()}>
          Try again
        </Button>
      </LandingGlassCard>
    );
  }

  const isFirstTimeRewards =
    data.pendingRewards.length === 0 &&
    !data.unopenedMysteryBox &&
    data.wallet.tierCredits === 0 &&
    (data.legacy?.lifetimeWins ?? 0) === 0 &&
    (data.legacy?.boardsPlayed ?? 0) === 0;

  const tierVisual = getTierVisual(data.dashboard.tier.slug);
  const tierDisplay = getTierDisplayName(data.dashboard.tier.slug);

  return (
    <div className="space-y-6">
      {/* Tier + points summary */}
      <LandingGlassCard
        className="p-5 sb-card-lift relative overflow-hidden"
        style={{ borderColor: `${tierVisual.color}44` }}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${tierVisual.gradient} pointer-events-none opacity-60`}
        />
        <div className="relative grid sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">
              {REWARDS_SECTIONS.currentTier}
            </p>
            <p className="text-2xl font-bold text-white flex items-center gap-2">
              <span aria-hidden>{tierVisual.icon}</span>
              {tierDisplay}
            </p>
            <p className="text-xs text-sb-muted mt-1">
              Level {data.tierCard.tierLevel}
              {data.tierCard.nextTierName
                ? ` · ${data.dashboard.creditsToNextTier.toLocaleString()} credits to ${getTierDisplayName(
                    data.dashboard.nextTier?.slug ?? data.dashboard.tier.slug
                  )}`
                : " · Max tier"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">
              {REWARDS_SECTIONS.rewardPoints}
            </p>
            <p className="text-2xl font-bold tabular-nums" style={{ color: tierVisual.color }}>
              {data.wallet.tierCredits.toLocaleString()}
            </p>
            <p className="text-xs text-sb-muted mt-1">{REWARDS_SECTIONS.tierCredits}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">This week</p>
            <p className="text-2xl font-bold text-white tabular-nums">
              {data.wallet.weeklyTierCredits.toLocaleString()}
            </p>
            <p className="text-xs text-sb-muted mt-1">Weekly credits earned</p>
          </div>
        </div>
      </LandingGlassCard>

      <PlayerTierCard />

      {/* Progress goals */}
      {derived ? (
        <LandingGlassCard className="p-5 sb-card-lift">
          <h3 className="text-sm font-semibold text-white mb-4">{REWARDS_SECTIONS.weeklyProgress}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {derived.progress.map((goal) => (
              <RewardsProgressBar
                key={goal.id}
                label={goal.label}
                current={goal.current}
                target={goal.target}
                pct={goal.pct}
                accent={tierVisual.color}
              />
            ))}
          </div>
        </LandingGlassCard>
      ) : null}

      {/* Streaks */}
      {derived ? (
        <LandingGlassCard className="p-5 sb-card-lift">
          <h3 className="text-sm font-semibold text-white mb-3">{REWARDS_SECTIONS.streaks}</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <StreakCard emoji="🔥" label="Daily login" copy={derived.streaks.copy.daily} />
            <StreakCard emoji="📅" label="Weekly play" copy={derived.streaks.copy.weekly} />
            <StreakCard emoji="⚡" label="Activity" copy={derived.streaks.copy.monthly} />
          </div>
        </LandingGlassCard>
      ) : null}

      {isFirstTimeRewards ? (
        <AliveEmptyState context="no_rewards" emoji="🎁" />
      ) : null}

      {data.unopenedMysteryBox ? (
        <LandingGlassCard className="p-5 flex flex-wrap items-center justify-between gap-4 border border-purple-500/30 wrd-panel-cube-ready sb-card-lift">
          <div>
            <p className="text-xs uppercase tracking-wider text-purple-300">🎁 {SQUARE_DROP_READY}</p>
            <p className="text-white font-semibold">Your {SQUARE_DROP_NAME} is waiting</p>
          </div>
          <Button onClick={() => setShowBox(true)} className="sb-btn-press min-h-[44px]">
            Open Drop
          </Button>
        </LandingGlassCard>
      ) : null}

      {/* Featured achievements */}
      {derived && !isFirstTimeRewards ? (
        <section aria-labelledby="featured-achievements-heading">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 id="featured-achievements-heading" className="text-lg font-semibold text-white">
              {REWARDS_SECTIONS.lifetimeAchievements}
            </h3>
            <Link
              href="/my-games/rewards/achievements"
              className="text-xs text-sb-glow hover:underline min-h-[44px] inline-flex items-center"
            >
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {derived.featured.map((a) => (
              <LandingGlassCard
                key={a.id}
                className={[
                  "p-4 sb-card-lift",
                  a.unlocked ? "rewards-achievement-unlock border-emerald-500/25" : "opacity-70",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden>
                    {a.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm">{a.title}</p>
                    <p className="text-xs text-sb-muted mt-0.5 line-clamp-2">{a.description}</p>
                    {a.progress && !a.unlocked ? (
                      <div className="mt-2">
                        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rewards-progress-fill bg-sb-purple/70"
                            style={{
                              width: `${Math.round((a.progress.current / a.progress.target) * 100)}%`,
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-sb-muted mt-1 tabular-nums">
                          {a.progress.current} / {a.progress.target}
                        </p>
                      </div>
                    ) : null}
                    <p className="text-[10px] text-sb-gold mt-2">{a.rewardLabel}</p>
                  </div>
                  {a.unlocked ? (
                    <span className="text-emerald-400 text-xs shrink-0" aria-label="Unlocked">
                      ✓
                    </span>
                  ) : null}
                </div>
              </LandingGlassCard>
            ))}
          </div>
        </section>
      ) : null}

      {/* Available / locked rewards */}
      {data.catalog.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          <CatalogPreview
            title={REWARDS_SECTIONS.availableRewards}
            items={catalogByTier.available}
            emptyCopy="Earn more credits to unlock shop items."
            href="/my-games/rewards/credit-shop"
          />
          <CatalogPreview
            title={REWARDS_SECTIONS.lockedRewards}
            items={catalogByTier.locked}
            emptyCopy="You've unlocked everything in the catalog."
            href="/my-games/rewards/credit-shop"
            locked
          />
        </div>
      ) : null}

      {/* Upcoming milestones */}
      {derived && derived.milestones.length ? (
        <LandingGlassCard className="p-5 sb-card-lift">
          <h3 className="text-lg font-semibold text-white mb-3">{REWARDS_SECTIONS.upcomingMilestones}</h3>
          <ul className="space-y-3">
            {derived.milestones.map((m) => (
              <li key={m.id} className="flex items-center gap-3">
                <span className="text-xl" aria-hidden>
                  {m.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{m.title}</p>
                  {m.progress ? (
                    <RewardsProgressBar
                      label=""
                      current={m.progress.current}
                      target={m.progress.target}
                      pct={Math.round((m.progress.current / m.progress.target) * 100)}
                      className="mt-1"
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </LandingGlassCard>
      ) : null}

      <div className="grid md:grid-cols-2 gap-4">
        <QuickLink
          href="/my-games/rewards/gift-shop"
          icon="🎀"
          title="Gift Shop"
          detail="Claim pending rewards, promotions, and bonus items"
        />
        <QuickLink
          href="/my-games/rewards/credit-shop"
          icon="💎"
          title="Credit Shop"
          detail={`Spend ${data.wallet.tierCredits.toLocaleString()} Tier Credits on squares, lines & shields`}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <QuickLink
          href="/my-games/rewards/square-drop"
          icon="🎁"
          title={SQUARE_DROP_NAME}
          detail="Weekly premium reward experience"
        />
        <QuickLink
          href="/my-games/referrals"
          icon="👥"
          title="Invite Friends"
          detail={`${data.referral.qualifiedReferrals} qualified · Code ${data.referral.referralCode}`}
        />
        <QuickLink
          href="/my-games/rewards/achievements"
          icon="🏆"
          title="Achievements"
          detail="100+ milestones — build your legacy"
        />
      </div>

      {data.pendingRewards.length ? (
        <LandingGlassCard className="p-5 sb-card-lift">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h3 className="text-lg font-semibold text-white">Ready to claim</h3>
            <Link href="/my-games/rewards/gift-shop" className="text-xs text-sb-glow hover:underline">
              Open Gift Shop →
            </Link>
          </div>
          <ul className="space-y-2">
            {data.pendingRewards.map((r) => (
              <li key={r.id as string} className="flex justify-between text-sm border-b border-white/5 py-2">
                <span className="text-white">{r.title as string}</span>
                <span className="text-sb-muted capitalize">{r.reward_type as string}</span>
              </li>
            ))}
          </ul>
        </LandingGlassCard>
      ) : null}

      <MysteryBoxModal
        open={showBox}
        onClose={() => setShowBox(false)}
        onOpened={() => void refresh({ background: true })}
      />
    </div>
  );
}

function StreakCard({ emoji, label, copy }: { emoji: string; label: string; copy: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 min-h-[88px]">
      <p className="text-xs font-semibold text-white mb-1">
        <span aria-hidden>{emoji}</span> {label}
      </p>
      <p className="text-xs text-sb-muted leading-relaxed">{copy}</p>
    </div>
  );
}

function CatalogPreview({
  title,
  items,
  emptyCopy,
  href,
  locked = false,
}: {
  title: string;
  items: Array<{ id: string; title: string; creditCost: number; minTierSlug?: string | null }>;
  emptyCopy: string;
  href: string;
  locked?: boolean;
}) {
  return (
    <LandingGlassCard className="p-5 sb-card-lift h-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <Link href={href} className="text-xs text-sb-glow hover:underline">
          Shop →
        </Link>
      </div>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm gap-2">
              <span className={locked ? "text-sb-muted" : "text-white"}>{item.title}</span>
              <span className="text-sb-muted text-xs shrink-0 tabular-nums">
                {locked && item.minTierSlug
                  ? getTierDisplayName(item.minTierSlug as Parameters<typeof getTierDisplayName>[0])
                  : `${item.creditCost.toLocaleString()} cr`}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-sb-muted">{emptyCopy}</p>
      )}
    </LandingGlassCard>
  );
}

function QuickLink({
  href,
  icon,
  title,
  detail,
}: {
  href: string;
  icon: string;
  title: string;
  detail: string;
}) {
  return (
    <Link href={href} className="block min-h-[44px]">
      <LandingGlassCard className="p-4 h-full hover:border-sb-purple/30 transition-colors sb-card-lift">
        <p className="text-2xl mb-2" aria-hidden>
          {icon}
        </p>
        <p className="font-semibold text-white">{title}</p>
        <p className="text-xs text-sb-muted mt-1">{detail}</p>
      </LandingGlassCard>
    </Link>
  );
}
