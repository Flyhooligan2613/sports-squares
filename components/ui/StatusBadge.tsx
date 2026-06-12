import type { ReactNode } from "react";

export type StatusBadgeVariant =
  | "live"
  | "paid"
  | "active"
  | "upcoming"
  | "open"
  | "board-ready"
  | "info"
  | "new"
  | "winner"
  | "big-win"
  | "processing"
  | "final-minutes"
  | "last-squares";

const VARIANT_CLASS: Record<StatusBadgeVariant, string> = {
  live: "sb-status-badge sb-status-badge--live",
  paid: "sb-status-badge sb-status-badge--live",
  active: "sb-status-badge sb-status-badge--live",
  upcoming: "sb-status-badge sb-status-badge--upcoming",
  open: "sb-status-badge sb-status-badge--upcoming",
  "board-ready": "sb-status-badge sb-status-badge--upcoming",
  info: "sb-status-badge sb-status-badge--info",
  new: "sb-status-badge sb-status-badge--info",
  winner: "sb-status-badge sb-status-badge--winner",
  "big-win": "sb-status-badge sb-status-badge--winner",
  processing: "sb-status-badge sb-status-badge--processing",
  "final-minutes": "sb-status-badge sb-status-badge--urgent",
  "last-squares": "sb-status-badge sb-status-badge--urgent",
};

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  children: ReactNode;
  pulse?: boolean;
  dot?: boolean;
  className?: string;
}

export default function StatusBadge({
  variant,
  children,
  pulse = false,
  dot = false,
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={[
        VARIANT_CLASS[variant],
        pulse ? "sb-status-badge--pulse" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {dot ? <span className="sb-status-badge-dot" aria-hidden /> : null}
      {children}
    </span>
  );
}
