"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { formatNavHref, pushNavEntry } from "@/lib/navigation/historyStack";

function NavHistoryTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    pushNavEntry(formatNavHref(pathname, searchParams));
  }, [pathname, searchParams]);

  return null;
}

export default function NavHistoryTracker() {
  return (
    <Suspense fallback={null}>
      <NavHistoryTrackerInner />
    </Suspense>
  );
}
