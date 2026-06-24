"use client";

import { usePathname } from "next/navigation";
import StaffPortalLink from "@/components/StaffPortalLink";

/** Subtle staff link on pages without a footer (Pick'em, My Games, etc.). Hidden on admin routes. */
export default function GlobalStaffPortalHint() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const hasFooter =
    pathname === "/" ||
    pathname.startsWith("/games/") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/faq") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/support") ||
    pathname.startsWith("/transparency") ||
    pathname.startsWith("/responsible-gaming") ||
    pathname.startsWith("/trust");

  if (hasFooter) {
    return null;
  }

  return (
    <div
      className="fixed bottom-2 left-3 z-20 pointer-events-none"
      aria-hidden={false}
    >
      <StaffPortalLink className="pointer-events-auto" />
    </div>
  );
}
