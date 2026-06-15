"use client";

import { ensurePushServiceWorker } from "@/lib/push/ensureServiceWorker";

const SUBSCRIBE_TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

export async function subscribeToPushNotifications(): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, error: "Push notifications are not supported on this device." };
  }

  if (!("Notification" in window)) {
    return { ok: false, error: "Notifications are not supported on this browser." };
  }

  try {
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      return { ok: false, error: "Notification permission was denied." };
    }

    const keyRes = await withTimeout(
      fetch("/api/player/push/vapid-public-key", { cache: "no-store" }),
      SUBSCRIBE_TIMEOUT_MS,
      "Push setup timed out. Check your connection and try again."
    );

    if (!keyRes.ok) {
      return { ok: false, error: "Push is not configured on the server yet." };
    }

    const { publicKey } = (await keyRes.json()) as { publicKey?: string };
    if (!publicKey) {
      return { ok: false, error: "Push is not configured on the server yet." };
    }

    const registration = await ensurePushServiceWorker();
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await withTimeout(
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }),
        SUBSCRIBE_TIMEOUT_MS,
        "Could not connect alerts to this device. On iPhone, add SquareBoards to your Home Screen first, then try again."
      );
    }

    const json = subscription.toJSON();
    const res = await withTimeout(
      fetch("/api/player/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
          userAgent: navigator.userAgent,
        }),
      }),
      SUBSCRIBE_TIMEOUT_MS,
      "Saving your alert preferences timed out. Try again in a moment."
    );

    if (!res.ok) {
      const payload = (await res.json()) as { error?: string };
      return { ok: false, error: payload.error ?? "Could not save subscription." };
    }

    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not enable game day alerts.";
    return { ok: false, error: message };
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as Uint8Array<ArrayBuffer>;
}
