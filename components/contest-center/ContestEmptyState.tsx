import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AliveEmptyState from "@/components/alive/AliveEmptyState";
import { ContestJoinLabel } from "@/components/contest-center/ContestJoinButton";
import { rememberContestJoin } from "@/lib/contestCenter/buildViewModel";
import { CONTEST_CENTER, contestSpotsLeft } from "@/lib/platform/language";

export default function ContestEmptyState() {
  return <AliveEmptyState context="contest_center" emoji="🏆" />;
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
