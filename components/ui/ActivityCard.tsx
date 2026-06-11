import Link from "next/link";
import type { ReactNode } from "react";

interface ActivityCardProps {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function ActivityCard({
  title,
  subtitle,
  meta,
  badge,
  actions,
  href,
  onClick,
  className = "",
}: ActivityCardProps) {
  const content = (
    <>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="font-semibold text-white truncate">{title}</p>
          {badge}
        </div>
        {subtitle && (
          <p className="text-sb-muted text-sm truncate">{subtitle}</p>
        )}
        {meta && <div className="mt-2">{meta}</div>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {actions}
        </div>
      )}
    </>
  );

  const classes = `sb-activity-card ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${classes} text-left w-full`}>
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}

export function ActivityCardButton({
  children,
  href,
  onClick,
  variant = "default",
  disabled,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "primary";
  disabled?: boolean;
}) {
  const classes = [
    "inline-flex items-center justify-center min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
    variant === "primary"
      ? "bg-sb-purple/15 hover:bg-sb-purple/25 border border-sb-purple/30 text-sb-glow"
      : "bg-white/5 hover:bg-white/10 border border-white/10 text-sb-secondary hover:text-white",
    disabled ? "opacity-50 pointer-events-none" : "",
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
