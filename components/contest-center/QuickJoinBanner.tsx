import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import type { ContestListing } from "@/lib/contestCenter/types";
import { rememberContestJoin } from "@/lib/contestCenter/buildViewModel";

export default function QuickJoinBanner({ contest }: { contest: ContestListing }) {
  return (
    <LandingGlassCard className="cc-quick-join p-5 sm:p-6">
      <div className="cc-quick-join-inner">
        <div>
          <p className="cc-quick-join-kicker">Play Again</p>
          <p className="cc-quick-join-title">
            {contest.emoji} {contest.title}
          </p>
          <p className="text-sm text-sb-muted">Jump back into your last contest — one tap.</p>
        </div>
        <Button
          href={contest.href}
          variant="primary"
          onClick={() => rememberContestJoin(contest.id)}
        >
          Play Again
        </Button>
      </div>
    </LandingGlassCard>
  );
}

export function RecommendationsSection({
  contests,
}: {
  contests: ContestListing[];
}) {
  if (contests.length === 0) return null;

  return (
    <section className="cc-section" aria-labelledby="cc-rec-heading">
      <h2 id="cc-rec-heading" className="cc-section-title">
        Recommended For You
      </h2>
      <div className="cc-rec-list">
        {contests.map((contest) => (
          <Link
            key={contest.id}
            href={contest.href}
            className="cc-rec-row"
            onClick={() => rememberContestJoin(contest.id)}
          >
            <span aria-hidden>{contest.emoji}</span>
            <div>
              <p className="font-semibold text-white">{contest.title}</p>
              {contest.subtitle ? (
                <p className="text-sm text-sb-muted">{contest.subtitle}</p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
