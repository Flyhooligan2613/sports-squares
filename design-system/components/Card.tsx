import { cn } from "../utils/cn";

export type CardVariant =
  | "default"
  | "stat"
  | "contest"
  | "player"
  | "revenue"
  | "wallet"
  | "compliance"
  | "alert"
  | "activity"
  | "glass"
  | "executive";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  interactive?: boolean;
  title?: string;
  subtitle?: string;
  value?: string;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
}

const VARIANT_CLASS: Record<CardVariant, string> = {
  default: "",
  stat: "sqds-card--stat",
  contest: "sqds-card--contest",
  player: "sqds-card--player",
  revenue: "sqds-card--revenue",
  wallet: "sqds-card--wallet",
  compliance: "sqds-card--compliance",
  alert: "sqds-card--alert",
  activity: "sqds-card--activity",
  glass: "sqds-card--glass",
  executive: "sqds-card--executive",
};

export function Card({
  variant = "default",
  interactive = false,
  title,
  subtitle,
  value,
  badge,
  footer,
  className,
  children,
  ...props
}: CardProps) {
  const hasHeader = title || subtitle || badge;

  return (
    <article
      className={cn(
        "sqds-card",
        VARIANT_CLASS[variant],
        interactive && "sqds-card--interactive",
        className
      )}
      {...props}
    >
      {hasHeader ? (
        <header className="sqds-card__header">
          <div>
            {title ? <h3 className="sqds-card__title">{title}</h3> : null}
            {subtitle ? <p className="sqds-card__subtitle">{subtitle}</p> : null}
          </div>
          {badge}
        </header>
      ) : null}
      {value ? <p className="sqds-card__value">{value}</p> : null}
      {children}
      {footer ? <footer className="sqds-card__footer">{footer}</footer> : null}
    </article>
  );
}
