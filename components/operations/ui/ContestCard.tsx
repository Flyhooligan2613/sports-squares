import type { OpsContest } from "@/lib/operations/types";

interface ContestCardProps {
  contest: OpsContest;
  className?: string;
}

const STATUS_CLASS: Record<OpsContest["status"], string> = {
  live: "ops-badge-success",
  upcoming: "ops-badge-blue",
  settled: "ops-badge-muted",
};

export default function ContestCard({ contest, className = "" }: ContestCardProps) {
  const fillPercent = Math.round((contest.entries / contest.capacity) * 100);

  return (
    <article className={`ops-glass-card ops-contest-card ${className}`}>
      <div className="ops-contest-card-header">
        <div>
          <p className="ops-contest-sport">{contest.sport}</p>
          <h4 className="ops-contest-name">{contest.name}</h4>
        </div>
        <span className={`ops-badge ${STATUS_CLASS[contest.status]}`}>
          {contest.status}
        </span>
      </div>
      <div className="ops-contest-fill">
        <div className="ops-contest-fill-bar">
          <div
            className="ops-contest-fill-progress"
            style={{ width: `${fillPercent}%` }}
          />
        </div>
        <p className="ops-contest-fill-label">
          {contest.entries}/{contest.capacity} entries · {fillPercent}%
        </p>
      </div>
      <div className="ops-contest-card-footer">
        <span className="ops-contest-prize">{contest.prizePool}</span>
        <span className="ops-contest-time">{contest.startsIn}</span>
      </div>
    </article>
  );
}
