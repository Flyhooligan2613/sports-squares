"use client";

import type { ReactNode } from "react";
import SportBackdrop from "@/components/sports/SportBackdrop";

interface SportHubBackdropShellProps {
  sportId: string;
  className?: string;
  children: ReactNode;
}

/** Full-page sport hub wrapper with fixed sport backdrop behind content */
export default function SportHubBackdropShell({
  sportId,
  className = "",
  children,
}: SportHubBackdropShellProps) {
  return (
    <div
      className={["sport-hub-shell relative isolate flex flex-col", className]
        .filter(Boolean)
        .join(" ")}
    >
      <SportBackdrop sportId={sportId} variant="full" fixed />
      <div className="sport-hub-shell-content relative z-[1] flex flex-col flex-1">{children}</div>
    </div>
  );
}
