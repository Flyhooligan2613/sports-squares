"use client";

import { usePathname, useSearchParams } from "next/navigation";
import SportBackdrop from "@/components/sports/SportBackdrop";
import {
  resolveAppBackdropSportId,
  shouldSkipAppAmbientBackdrop,
} from "@/lib/sports/sportBackdrops";

/** App-wide fixed sport backdrop — fills pages without their own SportBackdrop */
export default function AppAmbientBackdrop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (shouldSkipAppAmbientBackdrop(pathname)) return null;

  const sportId = resolveAppBackdropSportId(pathname, searchParams);

  return (
    <SportBackdrop
      sportId={sportId}
      variant="full"
      fixed
      className="app-ambient-backdrop pointer-events-none"
    />
  );
}
