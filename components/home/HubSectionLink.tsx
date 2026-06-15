"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import { scrollToHubSection } from "@/lib/home/hubSections";

type HubSectionLinkProps = ComponentProps<typeof Link>;

function hrefHasHash(href: HubSectionLinkProps["href"]): boolean {
  const hrefString = typeof href === "string" ? href : href.pathname ?? "";
  return hrefString.includes("#");
}

export default function HubSectionLink({
  href,
  onClick,
  scroll,
  ...props
}: HubSectionLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const preserveScroll = scroll ?? (hrefHasHash(href) ? false : undefined);

  return (
    <Link
      href={href}
      scroll={preserveScroll}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        const hrefString = typeof href === "string" ? href : href.pathname ?? "";
        if (!hrefString.includes("#")) return;

        const url = new URL(hrefString, window.location.origin);
        const hash = url.hash.replace(/^#/, "");
        if (!hash) return;

        const targetQuery = url.searchParams.toString();
        const currentQuery = searchParams.toString();
        const samePath = url.pathname === pathname;
        const sameQuery = targetQuery === currentQuery;

        if (samePath && sameQuery) {
          event.preventDefault();
          scrollToHubSection(hash);
          window.history.pushState(null, "", hrefString);
        }
      }}
      {...props}
    />
  );
}
