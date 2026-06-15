"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { formatNavHref, pushNavEntry } from "@/lib/navigation/historyStack";

export default function NavHistoryTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    pushNavEntry(formatNavHref(pathname, searchParams));
  }, [pathname, searchParams]);

  return null;
}
