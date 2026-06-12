import type { ReactNode } from "react";
import { Button } from "./Button";

interface SectionEmptyStateProps {
  emoji?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  compact?: boolean;
  children?: ReactNode;
}

export default function SectionEmptyState({
  emoji,
  title,
  description,
  actionLabel,
  actionHref,
  compact = false,
  children,
}: SectionEmptyStateProps) {
  return (
    <div
      className={[
        "sb-section-empty",
        compact ? "sb-section-empty--compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {emoji ? (
        <span className="sb-section-empty-emoji" aria-hidden>
          {emoji}
        </span>
      ) : null}
      <p className="sb-section-empty-title">{title}</p>
      <p className="sb-section-empty-desc">{description}</p>
      {children}
      {actionLabel && actionHref ? (
        <Button href={actionHref} variant="secondary" size="sm" className="mt-4">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
