import Link from "next/link";

interface StaffPortalLinkProps {
  className?: string;
}

/** Discrete staff entry — not for players. Kept visually quiet by design. */
export default function StaffPortalLink({ className = "" }: StaffPortalLinkProps) {
  return (
    <Link
      href="/admin/login"
      className={[
        "text-[10px] tracking-wide text-white/20 hover:text-white/45 transition-colors",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Staff portal sign in"
    >
      Staff
    </Link>
  );
}
