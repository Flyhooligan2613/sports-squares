import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "default" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  children: ReactNode;
  className?: string;
}

const VARIANTS: Record<Variant, string> = {
  primary: "sb-btn-primary",
  secondary: "sb-btn-secondary",
  ghost: "sb-btn-ghost",
};

const SIZES: Record<Size, string> = {
  default:
    "min-h-[52px] px-6 py-3 rounded-xl text-base",
  sm: "sb-btn-sm",
};

export function Button({
  variant = "primary",
  size = "default",
  href,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const classes = [
    "sb-btn-motion inline-flex items-center justify-center font-semibold transition-all duration-300 ease-out disabled:opacity-50 disabled:pointer-events-none disabled:transform-none",
    SIZES[size],
    VARIANTS[variant],
    className,
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}

export function SectionHeader({
  title,
  subtitle,
  className = "",
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`text-center mb-10 sm:mb-14 max-w-2xl mx-auto ${className}`}>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sb-muted text-sm sm:text-base leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
