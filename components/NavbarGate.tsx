"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function NavbarGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar =
    pathname.startsWith("/my-games") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/learn") ||
    pathname.startsWith("/support/messages") ||
    pathname.startsWith("/live-games") ||
    pathname.startsWith("/live-winners") ||
    pathname.startsWith("/favorites") ||
    pathname.startsWith("/admin");

  if (hideNavbar) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
