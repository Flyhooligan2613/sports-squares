"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "navbar-header sticky top-0 z-50 border-b transition-all duration-300 ease-out",
        scrolled
          ? "navbar-header-scrolled border-white/[0.08] bg-sb-bg/92 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
          : "border-white/[0.06] bg-sb-bg/80 backdrop-blur-xl",
      ].join(" ")}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        <Logo href="/" className="sb-logo-nav" />
        <Button
          href="/admin/login"
          variant="ghost"
          size="sm"
          className="navbar-host-btn min-h-[44px]"
        >
          Host Login
        </Button>
      </div>
    </header>
  );
}
