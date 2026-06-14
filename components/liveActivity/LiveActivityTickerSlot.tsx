"use client";

import { usePathname } from "next/navigation";
import LiveActivityTicker from "@/components/liveActivity/LiveActivityTicker";
import { isLiveActivityTickerRoute } from "@/lib/liveActivity/types";

export default function LiveActivityTickerSlot() {
  const pathname = usePathname();

  if (!isLiveActivityTickerRoute(pathname)) {
    return null;
  }

  return <LiveActivityTicker />;
}
