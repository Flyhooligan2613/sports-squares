import type { ContestStatus } from "@/lib/contestCenter/types";
import { STATUS_LABELS } from "@/lib/contestCenter/labels";

const STATUS_CLASS: Record<ContestStatus, string> = {
  open: "cc-status-open",
  filling: "cc-status-filling",
  almost_full: "cc-status-almost-full",
  locked: "cc-status-locked",
  live: "cc-status-live",
  completed: "cc-status-completed",
  coming_soon: "cc-status-soon",
};

export default function ContestStatusBadge({ status }: { status: ContestStatus }) {
  const isLive = status === "live";

  return (
    <span
      className={`cc-status-badge ${STATUS_CLASS[status]} ${isLive ? "cc-status-live-pulse" : ""}`}
      role="status"
    >
      {isLive ? <span className="cc-live-dot" aria-hidden /> : null}
      {STATUS_LABELS[status]}
    </span>
  );
}
