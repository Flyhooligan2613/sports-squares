import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "glass" | "elevated" | "interactive";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  glow?: boolean;
}

const VARIANTS: Record<CardVariant, string> = {
  default: "sb-card",
  glass: "sb-card-glass",
  elevated: "sb-card-elevated",
  interactive: "sb-card-hover",
};

export function Card({
  children,
  variant = "default",
  className = "",
  glow = false,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        VARIANTS[variant],
        glow ? "sb-card-glow" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 mb-5 ${className}`}
    >
      <div>
        <h3 className="text-white font-semibold text-base sm:text-lg tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sb-muted text-sm mt-1 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
