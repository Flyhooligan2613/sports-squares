import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { ContestJoinLabel } from "@/components/contest-center/ContestJoinButton";
import { rememberContestJoin } from "@/lib/contestCenter/buildViewModel";
import { PLATFORM_TERMS } from "@/lib/platform/legacy/competitiveLanguage";

export default function ContestEmptyState() {
  return (
    <LandingGlassCard className="cc-empty-hero p-8 sm:p-12 text-center">
      <p className="text-5xl mb-4" aria-hidden>
        🏆
      </p>
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
        No contests are available right now.
      </h2>
      <p className="text-sb-muted max-w-md mx-auto mb-8">
        The arena is gearing up. Explore upcoming sports, check the Daily Story, or
        connect with the community while the next contest opens.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button href="/game-day" variant="primary">
          Daily Story
        </Button>
        <Button href="/huddle" variant="secondary">
          Community
        </Button>
        <Button href="/games/nfl" variant="secondary">
          {PLATFORM_TERMS.browseLiveContests}
        </Button>
      </div>
      <p className="text-xs text-sb-muted mt-8">
        Upcoming: NFL · MLB · NBA · Pick&apos;em · Survivor · Tournament Royale
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
      <section className="cc-section" aria-labelledby="cc-live-heading">
        <h2 id="cc-live-heading" className="cc-section-title">
          Today&apos;s Live Contests
        </h2>
        <ContestEmptyState />
      </section>
    );
  }

  return (
    <section className="cc-section" aria-labelledby="cc-live-heading">
      <h2 id="cc-live-heading" className="cc-section-title">
        Today&apos;s Live Contests
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
                          ? `${contest.remainingSpots} spots left`
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
