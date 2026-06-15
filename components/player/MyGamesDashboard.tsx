"use client";

import { useEffect, useState } from "react";
import ActiveGameCard from "@/components/player/ActiveGameCard";
import MyGamesHero from "@/components/player/MyGamesHero";
import NotificationsPanel from "@/components/player/NotificationsPanel";
import PlayerPayoutSetup from "@/components/player/PlayerPayoutSetup";
import QuickActions from "@/components/player/QuickActions";
import RecentWinsTimeline from "@/components/player/RecentWinsTimeline";
import UpcomingGameCard from "@/components/player/UpcomingGameCard";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import ExperiencePageSkeleton from "@/components/ui/ExperiencePageSkeleton";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import { Button } from "@/components/ui/Button";
import type { PlayerDashboardData } from "@/lib/player/dashboardTypes";
import { CONTEST_CTAS, EMPTY_STATE } from "@/lib/platform/language";

export default function MyGamesDashboard() {
  const [data, setData] = useState<PlayerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/player/dashboard", { cache: "no-store" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to load dashboard");
        }
        const json = (await res.json()) as PlayerDashboardData;
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    function handleProfileUpdated() {
      void load();
    }
    window.addEventListener("player-profile-updated", handleProfileUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener("player-profile-updated", handleProfileUpdated);
    };
  }, []);

  if (loading) {
    return <ExperiencePageSkeleton variant="player" />;
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <LandingGlassCard className="p-8">
          <p className="text-white font-semibold mb-2">Couldn&apos;t load your games</p>
          <p className="text-sb-muted text-sm mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </LandingGlassCard>
      </div>
    );
  }

  const hasBoards =
    data.activeGames.length > 0 || data.upcomingGames.length > 0;

  return (
    <>
      <MyGamesHero
        publicLabel={data.publicLabel}
        avatarEmoji={data.avatarEmoji}
        profileBio={data.profileBio}
        needsUsernameSetup={data.needsUsernameSetup}
        stats={data.stats}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <PlayerPayoutSetup
          initialStatus={data.connectStatus}
          connectEnabled={data.connectEnabled}
        />

        <section className="mb-12 sm:mb-16">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Active Games
              </h2>
              <p className="text-sb-muted text-sm mt-1">
                {data.activeGames.length > 0
                  ? "Your boards in play right now."
                  : "No live boards — grab one before kickoff."}
              </p>
            </div>
          </div>

          {data.activeGames.length > 0 ? (
            <div className="grid gap-4 lg:gap-5">
              {data.activeGames.map((game, index) => (
                <ActiveGameCard key={game.poolId} game={game} index={index} />
              ))}
            </div>
          ) : (
            <LandingGlassCard glow className="p-8 sm:p-10">
              <SectionEmptyState
                emoji="🏈"
                title={EMPTY_STATE.noGamesAvailable.title}
                description={EMPTY_STATE.noGamesAvailable.body}
                actionLabel={`${CONTEST_CTAS.browseContests} →`}
                actionHref="/games/nfl"
              />
            </LandingGlassCard>
          )}
        </section>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-12">
            {data.upcomingGames.length > 0 && (
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-5">
                  Upcoming Games
                </h2>
                <div className="grid gap-3">
                  {data.upcomingGames.map((game, index) => (
                    <UpcomingGameCard
                      key={game.poolId}
                      game={game}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-5">
                Recent Wins
              </h2>
              <RecentWinsTimeline wins={data.recentWins} />
            </section>
          </div>

          <aside className="space-y-5">
            <NotificationsPanel notifications={data.notifications} />
            <QuickActions />

            {!hasBoards && (
              <LandingGlassCard className="p-5 border-sb-purple/20">
                <p className="text-sm font-semibold text-white mb-1">
                  First time here?
                </p>
                <p className="text-xs text-sb-muted leading-relaxed">
                  Use the same email from your SquareBoards receipt to see every
                  board you&apos;ve purchased.
                </p>
              </LandingGlassCard>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
