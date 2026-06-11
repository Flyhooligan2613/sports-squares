import type { PoolStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  PoolStatus,
  { label: string; className: string }
> = {
  open: {
    label: "Open",
    className: "bg-sb-success/15 text-sb-success border-sb-success/30",
  },
  locked: {
    label: "Locked",
    className: "bg-sb-gold/15 text-sb-gold border-sb-gold/30",
  },
  "numbers-drawn": {
    label: "Numbers Drawn",
    className: "bg-sb-purple/15 text-sb-glow border-sb-purple/30",
  },
  completed: {
    label: "Completed",
    className: "bg-white/5 text-sb-muted border-white/10",
  },
  archived: {
    label: "Archived",
    className: "bg-white/5 text-sb-muted/70 border-white/5",
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
