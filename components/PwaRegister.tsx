"use client";

import { useEffect } from "react";

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
      if (!hadController || reloadedForUpdate) return;
      reloadedForUpdate = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registration = reg;
        void reg.update();
        document.addEventListener("visibilitychange", onVisible);
      })
      .catch(() => {
        /* registration optional */
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
