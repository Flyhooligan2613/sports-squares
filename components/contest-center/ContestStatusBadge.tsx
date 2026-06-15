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
  return (
    <span className={`cc-status-badge ${STATUS_CLASS[status]}`} role="status">
      {STATUS_LABELS[status]}
    </span>
  );
}
