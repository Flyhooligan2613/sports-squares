"use client";

import { useEffect } from "react";
import { devWarn } from "@/lib/devLog";

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;
    let reloadedForUpdate = false;
    const hadController = Boolean(navigator.serviceWorker.controller);

    const onVisible = () => {
      if (document.visibilityState === "visible" && hadController) {
        void registration?.update();
      }
    };

    const onControllerChange = () => {
      // Only reload when replacing an existing controller (deploy update), not first install.
      if (!hadController || reloadedForUpdate) return;
      reloadedForUpdate = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        registration = reg;
        void reg.update();
        document.addEventListener("visibilitychange", onVisible);
      })
      .catch((err) => {
        devWarn("[PwaRegister] service worker registration failed", err);
      });

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, []);

  return null;
}
