"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { prefetchRoutes } from "@/lib/client/fastFetch";
import { GAME_ROOM_HREF } from "@/lib/home/hubSections";

const PLAYER_WARM_ROUTES = [
  GAME_ROOM_HREF,
  "/my-games?mode=gameday",
  "/contest-center",
  "/pickem",
  "/survivor",
  "/games/nfl",
  "/games/mlb",
  "/games/nba",
  "/my-games/rewards",
];

export default function PlayerRoutePrefetch() {
  const router = useRouter();

  useEffect(() => {
    prefetchRoutes(PLAYER_WARM_ROUTES);
    for (const path of PLAYER_WARM_ROUTES) {
      try {
        router.prefetch(path);
      } catch {
        /* ignore */
      }
    }
  }, [router]);

  return null;
}
