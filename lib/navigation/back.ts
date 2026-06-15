import type { ReadonlyURLSearchParams } from "next/navigation";
import { GAME_ROOM_HREF } from "@/lib/home/hubSections";

export interface NavBackTarget {
  show: boolean;
  fallbackHref: string;
  label: string;
}

const GAME_ROOTS = [
  "/pickem",
  "/baseball-pickem",
  "/soccer-predictor",
  "/survivor",
  "/tournament-royale",
  "/contest-center",
  "/action-center",
  "/huddle",
  "/live-winners",
  "/live-tv",
  "/leaderboards",
  "/stats-hub",
  "/games/nfl",
  "/games/mlb",
  "/games/nba",
  "/games/ncaaf",
];

function isHubRoot(pathname: string, mode: string | null): boolean {
  if (pathname !== "/my-games") return false;
  return mode === "home" || mode === "gameday" || mode === null;
}

function parentPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return null;
  segments.pop();
  return `/${segments.join("/")}`;
}

export function resolveNavBackTarget(
  pathname: string,
  searchParams: ReadonlyURLSearchParams | URLSearchParams
): NavBackTarget {
  const mode = searchParams.get("mode");
  const defaultTarget: NavBackTarget = {
    show: false,
    fallbackHref: GAME_ROOM_HREF,
    label: "Back",
  };

  if (pathname === "/" || pathname === "/home") {
    return defaultTarget;
  }

  if (isHubRoot(pathname, mode)) {
    return defaultTarget;
  }

  if (pathname.startsWith("/my-games/")) {
    const parent = parentPath(pathname);
    return {
      show: true,
      fallbackHref: parent ?? GAME_ROOM_HREF,
      label: "Back",
    };
  }

  if (pathname.startsWith("/pool/")) {
    return {
      show: true,
      fallbackHref: "/contest-center",
      label: "Back to contests",
    };
  }

  for (const root of GAME_ROOTS) {
    if (pathname === root) {
      return {
        show: true,
        fallbackHref: GAME_ROOM_HREF,
        label: "Back to Game Room",
      };
    }
    if (pathname.startsWith(`${root}/`)) {
      return {
        show: true,
        fallbackHref: root,
        label: "Back",
      };
    }
  }

  const parent = parentPath(pathname);
  if (parent) {
    return {
      show: true,
      fallbackHref: parent,
      label: "Back",
    };
  }

  return {
    show: true,
    fallbackHref: GAME_ROOM_HREF,
    label: "Back",
  };
}
