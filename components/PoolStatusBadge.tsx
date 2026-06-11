import type { PoolStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  PoolStatus,
  { label: string; className: string }
> = {
  open: {
    label: "Open",
    className: "bg-green-500/15 text-green-400 border-green-500/30",
  },
  locked: {
    label: "Locked",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  "numbers-drawn": {
    label: "Numbers Drawn",
    className: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  },
  completed: {
    label: "Completed",
    className: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  },
  archived: {
    label: "Archived",
    className: "bg-slate-600/15 text-slate-500 border-slate-600/30",
  },
};

export default function PoolStatusBadge({ status }: { status: PoolStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
