import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  action,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={[
        "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10 sb-xp-hero-enter",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight sb-page-header-title">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sb-muted text-sm sm:text-base mt-2 leading-relaxed max-w-xl">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
