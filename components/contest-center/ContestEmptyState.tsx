import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { ContestJoinLabel } from "@/components/contest-center/ContestJoinButton";
import { rememberContestJoin } from "@/lib/contestCenter/buildViewModel";
import { CONTEST_CENTER, contestSpotsLeft, EMPTY_STATE } from "@/lib/platform/language";

export default function ContestEmptyState() {
  return (
    <LandingGlassCard className="cc-empty-hero p-8 sm:p-12 text-center">
      <p className="text-5xl mb-4" aria-hidden>
        🏆
      </p>
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
        {EMPTY_STATE.noContests.title}
      </h2>
      <p className="text-sb-muted max-w-md mx-auto mb-8">
        {EMPTY_STATE.noContests.body}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button href="/game-day" variant="primary">
          {EMPTY_STATE.noContests.ctaDailyStory}
        </Button>
        <Button href="/huddle" variant="secondary">
          {EMPTY_STATE.noContests.ctaCommunity}
        </Button>
        <Button href="/games/nfl" variant="secondary">
          {EMPTY_STATE.noContests.ctaBrowse}
        </Button>
      </div>
      <p className="text-xs text-sb-muted mt-8">
        {EMPTY_STATE.noContests.upcomingHint}
      </p>
    </LandingGlassCard>
  );
}

export function LiveContestsSection({
  contests,
  empty,
}: {
  contests: { sport: string; items: import("@/lib/contestCenter/types").ContestListing[] }[];
  empty: boolean;
}) {
  if (empty) {
    return (
      <section id="cc-live-contests" className="cc-section hub-section-anchor" aria-labelledby="cc-live-heading">
        <h2 id="cc-live-heading" className="cc-section-title">
          {CONTEST_CENTER.todaysLiveContests}
        </h2>
        <ContestEmptyState />
      </section>
    );
  }

  return (
    <section id="cc-live-contests" className="cc-section hub-section-anchor" aria-labelledby="cc-live-heading">
      <h2 id="cc-live-heading" className="cc-section-title">
        {CONTEST_CENTER.todaysLiveContests}
      </h2>
      <div className="cc-live-groups">
        {contests.map((group) => (
          <div key={group.sport} className="cc-live-group">
            <h3 className="cc-live-sport">{group.sport}</h3>
            <div className="cc-live-list">
              {group.items.map((contest) => (
                <Link
                  key={contest.id}
                  href={contest.href}
                  className="cc-live-row"
                  onClick={() => rememberContestJoin(contest.id)}
                >
                  <span className="cc-live-emoji" aria-hidden>
                    {contest.emoji}
                  </span>
                  <div className="cc-live-row-body">
                    <p className="cc-live-row-title">{contest.title}</p>
                    <p className="cc-live-row-meta">
                      {[
                        contest.gameTimeLabel,
                        contest.entryFeeLabel,
                        contest.prizePoolLabel,
                        contest.remainingSpots != null
                          ? contestSpotsLeft(contest.remainingSpots)
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <span className="cc-live-join">
                    <ContestJoinLabel contest={contest} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
