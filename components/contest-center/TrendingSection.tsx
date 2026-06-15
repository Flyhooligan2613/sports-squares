import ContestCard from "@/components/contest-center/ContestCard";
import type { ContestListing } from "@/lib/contestCenter/types";

export default function TrendingSection({ contests }: { contests: ContestListing[] }) {
  if (contests.length === 0) return null;

  return (
    <section id="cc-trending-contests" className="cc-section hub-section-anchor" aria-labelledby="cc-trending-heading">
      <h2 id="cc-trending-heading" className="cc-section-title">
        Trending Contests
      </h2>
      <div className="cc-trending-grid">
        {contests.map((contest) => (
          <ContestCard key={contest.id} contest={contest} compact />
        ))}
      </div>
    </section>
  );
}
