"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void registration?.update();
      }
    };

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
    };
  }, []);

  return null;
}
