"use client";

import { useEffect, useRef, useState } from "react";
import { fetchAuthBootstrap } from "@/lib/auth/security/webauthnClient";
import {
  consumeFirstLoginWelcomePending,
  hasSeenFirstLoginWelcome,
} from "@/lib/auth/firstLoginWelcome";
import FirstLoginWelcomeModal from "@/components/auth/FirstLoginWelcomeModal";

export default function FirstLoginWelcomeGate() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const evaluatedRef = useRef(false);

  useEffect(() => {
    if (evaluatedRef.current) return;
    evaluatedRef.current = true;

    let cancelled = false;

    async function evaluate() {
      const pending = consumeFirstLoginWelcomePending();
      if (!pending) return;

      const bootstrap = await fetchAuthBootstrap();
      if (cancelled || !bootstrap.authenticated || !bootstrap.email) return;

      if (hasSeenFirstLoginWelcome(bootstrap.email)) return;

      setEmail(bootstrap.email);
      setOpen(true);
    }

    void evaluate();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <FirstLoginWelcomeModal
      open={open}
      email={email}
      onClose={() => setOpen(false)}
    />
  );
}
