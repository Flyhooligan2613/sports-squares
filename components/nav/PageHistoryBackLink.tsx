"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { resolveNavBackTarget } from "@/lib/navigation/back";
import { consumePreviousNav, formatNavHref } from "@/lib/navigation/historyStack";

interface PageHistoryBackLinkProps {
  className?: string;
  label?: string;
  fallbackHref?: string;
}

function PageHistoryBackLinkInner({
  className = "",
  label = "Back",
  fallbackHref,
}: PageHistoryBackLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentHref = formatNavHref(pathname, searchParams);
  const target = resolveNavBackTarget(pathname, searchParams);
  const resolvedFallback = fallbackHref ?? target.fallbackHref;

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      consumePreviousNav(currentHref);
      router.back();
      return;
    }

    const previous = consumePreviousNav(currentHref);
    if (previous && previous !== currentHref) {
      router.push(previous);
      return;
    }

    router.push(resolvedFallback);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={className}
      aria-label={label}
    >
      ← {label}
    </button>
  );
}

export default function PageHistoryBackLink(props: PageHistoryBackLinkProps) {
  return (
    <Suspense fallback={null}>
      <PageHistoryBackLinkInner {...props} />
    </Suspense>
  );
}
