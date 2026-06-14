"use client";

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

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    return { ok: false, error: "Notification permission was denied." };
  }

  const keyRes = await fetch("/api/player/push/vapid-public-key", { cache: "no-store" });
  if (!keyRes.ok) {
    return { ok: false, error: "Push is not configured on the server yet." };
  }

  const { publicKey } = (await keyRes.json()) as { publicKey?: string };
  if (!publicKey) {
    return { ok: false, error: "Push is not configured on the server yet." };
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const json = subscription.toJSON();
  const res = await fetch("/api/player/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: json.keys,
      userAgent: navigator.userAgent,
    }),
  });

  if (!res.ok) {
    const payload = (await res.json()) as { error?: string };
    return { ok: false, error: payload.error ?? "Could not save subscription." };
  }

  return { ok: true };
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
