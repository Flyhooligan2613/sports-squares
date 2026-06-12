"use client";

import { Menu } from "lucide-react";
import { useNavDrawerSafe } from "./NavDrawerProvider";

interface NavDrawerTriggerProps {
  className?: string;
  label?: string;
}

export default function NavDrawerTrigger({
  className = "",
  label = "Open menu",
}: NavDrawerTriggerProps) {
  const drawer = useNavDrawerSafe();

  if (!drawer) return null;

  return (
    <button
      type="button"
      onClick={drawer.toggle}
      className={["nav-drawer-trigger", className].filter(Boolean).join(" ")}
      aria-label={label}
      aria-expanded={drawer.isOpen}
    >
      <Menu className="w-5 h-5" strokeWidth={2} />
    </button>
  );
}
