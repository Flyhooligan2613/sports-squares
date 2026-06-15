"use client";

import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";
import {
  JOIN_THE_CONTEST_FALLBACK,
  resolveContestCtaFromListing,
  type ContestCtaAdminConfig,
} from "@/lib/contestCenter/cta";
import type { ContestListing } from "@/lib/contestCenter/types";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof Button>;

interface ContestJoinButtonProps extends Omit<ButtonProps, "children"> {
  contest?: ContestListing;
  label?: string;
  featured?: boolean;
  adminConfig?: ContestCtaAdminConfig | null;
  fullWidth?: boolean;
  children?: never;
}

export default function ContestJoinButton({
  contest,
  label,
  featured = false,
  adminConfig,
  fullWidth = false,
  className = "",
  disabled,
  href,
  ...props
}: ContestJoinButtonProps) {
  const reducedMotion = useReducedMotion();

  const copy =
    label ??
    (contest
      ? resolveContestCtaFromListing(contest, { featured, adminConfig })
      : JOIN_THE_CONTEST_FALLBACK);

  const isDisabled = disabled ?? contest?.status === "coming_soon";
  const targetHref =
    href ?? (contest?.status === "coming_soon" ? undefined : contest?.href);

  return (
    <Button
      href={targetHref}
      variant="primary"
      disabled={isDisabled}
      aria-label={copy}
      className={[
        "contest-join-btn",
        featured ? "contest-join-btn-featured" : "",
        !reducedMotion && featured ? "contest-join-btn-glow" : "",
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {copy}
    </Button>
  );
}

/** Inline CTA text for list rows and card links. */
export function ContestJoinLabel({
  contest,
  featured = false,
  adminConfig,
}: {
  contest: ContestListing;
  featured?: boolean;
  adminConfig?: ContestCtaAdminConfig | null;
}) {
  return (
    <span className="contest-join-label">
      {resolveContestCtaFromListing(contest, { featured, adminConfig })}
    </span>
  );
}
