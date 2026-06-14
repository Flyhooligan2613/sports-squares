"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import CashOutSetupModal from "@/components/auth/CashOutSetupModal";
import {
  consumeCashOutPromptPending,
  markCashOutPromptDismissed,
  OPEN_CASHOUT_SETUP_EVENT,
  wasCashOutPromptDismissed,
} from "@/lib/auth/cashOutPrompt";
import { fetchAuthBootstrap } from "@/lib/auth/security/webauthnClient";

function shouldSkipRoute(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/auth");
}

function CashOutSetupGateInner() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const checkedRef = useRef(false);

  useEffect(() => {
    function onOpenPrompt() {
      setUrgent(true);
      setOpen(true);
    }
    window.addEventListener(OPEN_CASHOUT_SETUP_EVENT, onOpenPrompt);
    return () => window.removeEventListener(OPEN_CASHOUT_SETUP_EVENT, onOpenPrompt);
  }, []);

  useEffect(() => {
    if (checkedRef.current) return;
    if (shouldSkipRoute(pathname)) return;

    checkedRef.current = true;
    let cancelled = false;

    async function evaluate() {
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      if (cancelled) return;

      const bootstrap = await fetchAuthBootstrap();
      if (cancelled || !bootstrap.authenticated || !bootstrap.email) return;

      setEmail(bootstrap.email);

      const res = await fetch("/api/player/play-eligibility", { cache: "no-store" });
      if (!res.ok || cancelled) return;

      const data = (await res.json()) as {
        eligible?: boolean;
        blockers?: string[];
      };

      if (cancelled || data.eligible) return;
      if (!data.blockers?.includes("payout_account_required")) return;

      const justSignedUp = consumeCashOutPromptPending();
      const dismissed = wasCashOutPromptDismissed(bootstrap.email);

      if (justSignedUp || !dismissed) {
        setUrgent(justSignedUp);
        setOpen(true);
      }
    }

    void evaluate();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  function handleDismissLater() {
    if (email) markCashOutPromptDismissed(email);
    setOpen(false);
  }

  return (
    <CashOutSetupModal
      open={open}
      urgent={urgent}
      onClose={() => setOpen(false)}
      onDismissLater={handleDismissLater}
    />
  );
}

export default function CashOutSetupGate() {
  return (
    <Suspense fallback={null}>
      <CashOutSetupGateInner />
    </Suspense>
  );
}
