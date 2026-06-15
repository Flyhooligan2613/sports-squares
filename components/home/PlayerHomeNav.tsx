"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import HomeModeSwitcher from "@/components/home/HomeModeSwitcher";

function PlayerHomeNavInner() {
  const pathname = usePathname();
  if (!pathname.startsWith("/my-games") || pathname.startsWith("/my-games/login")) {
    return null;
  }

  return <HomeModeSwitcher variant="bar" />;
}

export default function PlayerHomeNav() {
  return (
    <Suspense fallback={null}>
      <PlayerHomeNavInner />
    </Suspense>
  );
}
