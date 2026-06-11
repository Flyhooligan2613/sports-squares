import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

interface LogoProps {
  variant?: "full" | "icon";
  className?: string;
  href?: string | false;
}

export default function Logo({
  variant = "full",
  className = "",
  href = "/",
}: LogoProps) {
  const content = (
    <>
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-sb-gradient-purple shrink-0 shadow-sb-glow"
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </span>
      {variant === "full" && (
        <span className="font-bold tracking-tight flex items-baseline gap-0">
          <span className="text-white">SQUARE</span>
          <span className="bg-gradient-to-r from-sb-glow to-sb-purple bg-clip-text text-transparent">
            BOARDS
          </span>
        </span>
      )}
    </>
  );

  const classes = `inline-flex items-center gap-2.5 ${className}`;

  if (href === false) {
    return <span className={classes}>{content}</span>;
  }

  return (
    <Link href={href} className={`${classes} group`}>
      {content}
    </Link>
  );
}
