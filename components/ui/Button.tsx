import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
  children: ReactNode;
  className?: string;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "sb-btn-primary bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5",
  secondary:
    "sb-btn-secondary bg-slate-900/80 hover:bg-slate-800 text-slate-100 border border-slate-600/60 hover:border-slate-500 hover:-translate-y-0.5 shadow-md shadow-black/20",
  ghost:
    "sb-btn-ghost text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent",
};

export function Button({
  variant = "primary",
  href,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center min-h-[52px] px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
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
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-50 tracking-tight mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
