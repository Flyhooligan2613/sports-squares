import type { LucideIcon } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  emoji?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  compact?: boolean;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  emoji,
  actionLabel,
  actionHref,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={compact ? "sb-empty-state py-10" : "sb-empty-state"}>
      {emoji ? (
        <span className="sb-section-empty-emoji" aria-hidden>
          {emoji}
        </span>
      ) : (
        <span className="sb-empty-icon">
          <Icon className="w-7 h-7" strokeWidth={1.5} />
        </span>
      )}
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-sb-muted text-sm max-w-sm mx-auto leading-relaxed mb-6">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Button href={actionHref} variant="primary" className="min-w-[160px]">
          {actionLabel}
        </Button>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button variant="primary" onClick={onAction} className="min-w-[160px]">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
