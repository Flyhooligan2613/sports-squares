import type { ReactNode } from "react";
import StatusBadge, { type StatusBadgeVariant } from "./StatusBadge";
import { Button } from "./Button";

interface ExperienceHeroStat {
  label: string;
  value: ReactNode;
}

interface ExperienceHeroProps {
  badgeLabel: string;
  badgeVariant?: StatusBadgeVariant;
  badgePulse?: boolean;
  title: string;
  subtitle: string;
  stats?: ExperienceHeroStat[];
  cta?: { label: string; href: string };
  className?: string;
}

export default function ExperienceHero({
  badgeLabel,
  badgeVariant = "live",
  badgePulse = true,
  title,
  subtitle,
  stats,
  cta,
  className = "",
}: ExperienceHeroProps) {
  return (
    <header
      className={[
        "text-center mb-8 sm:mb-10 sb-xp-hero-enter",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mb-4">
        <StatusBadge variant={badgeVariant} pulse={badgePulse} dot>
          {badgeLabel}
        </StatusBadge>
      </div>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">
        {title}
      </h1>
      <p className="text-sb-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
        {subtitle}
      </p>

      {stats && stats.length > 0 ? (
        <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="sb-xp-hero-stat">
              <dd className="text-lg sm:text-xl font-bold text-white tabular-nums">
                {stat.value}
              </dd>
              <dt className="text-[10px] sm:text-xs uppercase tracking-wider text-sb-muted mt-1">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      ) : null}

      {cta ? (
        <div className="mt-8">
          <Button href={cta.href} variant="primary">
            {cta.label}
          </Button>
        </div>
      ) : null}
    </header>
  );
}
