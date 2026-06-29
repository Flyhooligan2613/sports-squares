"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import LiveActivityTickerSlot from "@/components/liveActivity/LiveActivityTickerSlot";

export default function NavbarGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar =
    pathname.startsWith("/my-games") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/learn") ||
    pathname.startsWith("/support/messages") ||
    pathname.startsWith("/live-tv") ||
    pathname.startsWith("/action-center") ||
    pathname.startsWith("/game-day") ||
    pathname.startsWith("/live-games") ||
    pathname.startsWith("/live-winners") ||
    pathname.startsWith("/live-arena") ||
    pathname.startsWith("/pickem") ||
    pathname.startsWith("/baseball-pickem") ||
    pathname.startsWith("/soccer-predictor") ||
    pathname.startsWith("/favorites") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/ops") ||
    pathname.startsWith("/design-system");

  if (hideNavbar) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <LiveActivityTickerSlot />
      {children}
    </>
  );
}
