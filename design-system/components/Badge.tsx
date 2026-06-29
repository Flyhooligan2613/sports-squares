import { cn } from "../utils/cn";

export type BadgeVariant =
  | "live"
  | "winning"
  | "locked"
  | "pending"
  | "review"
  | "success"
  | "disabled"
  | "coming-soon"
  | "maintenance";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  showDot?: boolean;
  label?: string;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  live: "sqds-badge--live",
  winning: "sqds-badge--winning",
  locked: "sqds-badge--locked",
  pending: "sqds-badge--pending",
  review: "sqds-badge--review",
  success: "sqds-badge--success",
  disabled: "sqds-badge--disabled",
  "coming-soon": "sqds-badge--coming-soon",
  maintenance: "sqds-badge--maintenance",
};

const DEFAULT_LABEL: Record<BadgeVariant, string> = {
  live: "Live",
  winning: "Winning",
  locked: "Locked",
  pending: "Pending",
  review: "Review",
  success: "Success",
  disabled: "Disabled",
  "coming-soon": "Coming Soon",
  maintenance: "Maintenance",
};

export function Badge({
  variant = "live",
  showDot = variant === "live",
  label,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn("sqds-badge", VARIANT_CLASS[variant], className)} {...props}>
      {showDot ? <span className="sqds-badge__dot" aria-hidden /> : null}
      {children ?? label ?? DEFAULT_LABEL[variant]}
    </span>
  );
}
