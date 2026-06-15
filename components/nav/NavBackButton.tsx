"use client";

import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { resolveNavBackTarget } from "@/lib/navigation/back";

export default function NavBackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const target = resolveNavBackTarget(pathname, searchParams);

  if (!target.show) return null;

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(target.fallbackHref);
  }

  return (
    <button
      type="button"
      className="nav-back-btn"
      onClick={handleBack}
      aria-label={target.label}
      title={target.label}
    >
      <ChevronLeft className="nav-back-btn-icon" aria-hidden />
      <span className="nav-back-btn-label hidden sm:inline">{target.label}</span>
    </button>
  );
}
