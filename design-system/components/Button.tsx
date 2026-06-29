"use client";

import { cn } from "../utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "executive"
  | "glass"
  | "success";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "sqds-btn--primary",
  secondary: "sqds-btn--secondary",
  ghost: "sqds-btn--ghost",
  danger: "sqds-btn--danger",
  executive: "sqds-btn--executive",
  glass: "sqds-btn--glass",
  success: "sqds-btn--success",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "sqds-btn--sm",
  md: "",
  lg: "sqds-btn--lg",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "sqds-btn",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        loading && "sqds-btn--loading",
        disabled && "sqds-btn--disabled",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="sqds-btn__spinner" aria-hidden /> : null}
      {children}
    </button>
  );
}
