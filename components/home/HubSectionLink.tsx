"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import {
  hubViewModesMatch,
  scrollToHubSection,
  setPendingHubHash,
} from "@/lib/home/hubSections";

type HubSectionLinkProps = ComponentProps<typeof Link>;

function hrefHasHash(href: HubSectionLinkProps["href"]): boolean {
  const hrefString = typeof href === "string" ? href : href.pathname ?? "";
  return hrefString.includes("#");
}

function parseHubHref(href: string) {
  const url = new URL(href, window.location.origin);
  return {
    pathname: url.pathname,
    mode: url.searchParams.get("mode"),
    hash: url.hash.replace(/^#/, ""),
    hrefString: `${url.pathname}${url.search}${url.hash}`,
  };
}

export default function HubSectionLink({
  href,
  onClick,
  scroll,
  ...props
}: HubSectionLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const preserveScroll = scroll ?? (hrefHasHash(href) ? false : undefined);

  return (
    <Link
      href={href}
      scroll={preserveScroll}
      prefetch
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        const hrefString = typeof href === "string" ? href : href.pathname ?? "";
        if (!hrefString.includes("#")) return;

        const target = parseHubHref(hrefString);
        if (!target.hash) return;

        const samePath = target.pathname === pathname;
        const sameHubMode = hubViewModesMatch(searchParams.get("mode"), target.mode);

        if (!samePath) return;

        event.preventDefault();

        if (!sameHubMode) {
          setPendingHubHash(target.hash);
          router.push(target.hrefString, { scroll: false });
          return;
        }

        scrollToHubSection(target.hash);
        window.history.pushState(null, "", target.hrefString);
      }}
      {...props}
    />
  );
}
