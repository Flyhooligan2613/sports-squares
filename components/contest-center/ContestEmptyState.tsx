import Link from "next/link";
import AliveEmptyState from "@/components/alive/AliveEmptyState";
import ContestCountdown from "@/components/contest-center/ContestCountdown";
import ContestStatusBadge from "@/components/contest-center/ContestStatusBadge";
import { ContestJoinLabel } from "@/components/contest-center/ContestJoinButton";
import { rememberContestJoin } from "@/lib/contestCenter/buildViewModel";
import { CONTEST_CENTER, contestSpotsLeft } from "@/lib/platform/language";
import { EMPTY_STATE } from "@/lib/platform/language/emptyStateLanguage";

export default function ContestEmptyState() {
  return (
    <AliveEmptyState
      context="contest_center"
      emoji="🏆"
      title={EMPTY_STATE.noContests.title}
      body={EMPTY_STATE.noContests.body}
    />
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
                  className="cc-live-row sb-card-lift"
                  onClick={() => rememberContestJoin(contest.id)}
                >
                  <span className="cc-live-emoji" aria-hidden>
                    {contest.emoji}
                  </span>
                  <div className="cc-live-row-body">
                    <p className="cc-live-row-title">{contest.title}</p>
                    <p className="cc-live-row-meta">
                      {[
                        contest.entryFeeLabel,
                        contest.prizePoolLabel,
                        contest.remainingSpots != null
                          ? contestSpotsLeft(contest.remainingSpots)
                          : null,
                        contest.playersJoined != null
                          ? `${contest.playersJoined.toLocaleString()} players`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {contest.kickoffAt ? (
                      <ContestCountdown
                        kickoffAt={contest.kickoffAt}
                        status={contest.status}
                        compact
                        className="cc-live-row-countdown"
                      />
                    ) : null}
                  </div>
                  <div className="cc-live-row-aside">
                    {contest.status === "live" ? (
                      <span className="cc-live-badge cc-live-badge-sm" role="status">
                        <span className="cc-live-dot" aria-hidden />
                        Live
                      </span>
                    ) : (
                      <ContestStatusBadge status={contest.status} />
                    )}
                    <span className="cc-live-join">
                      <ContestJoinLabel contest={contest} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
