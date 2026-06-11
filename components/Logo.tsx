import Link from "next/link";

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
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shrink-0 shadow-lg shadow-indigo-500/20"
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
        <span className="font-bold text-slate-100 tracking-tight">
          Sports Squares
        </span>
      )}
    </>
  );

  const classes = [
    "inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity",
    className,
  ].join(" ");

  if (href !== false) {
    return (
      <Link href={href} className={classes} aria-label="Sports Squares home">
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
