import webpush from "web-push";
import type { PushSubscription as WebPushSubscription } from "web-push";
import { getVapidPublicKey, getVapidSubject, isPushConfigured } from "@/lib/push/config";
import type { PushSubscriptionRow } from "@/lib/push/subscriptions";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

let vapidConfigured = false;

function ensureVapid(): void {
  if (vapidConfigured) return;
  if (!isPushConfigured()) {
    throw new Error(
      "Web push is not configured. Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT."
    );
  }
  webpush.setVapidDetails(
    getVapidSubject(),
    getVapidPublicKey()!,
    process.env.VAPID_PRIVATE_KEY!.trim()
  );
  vapidConfigured = true;
}

export function rowToWebPushSubscription(row: PushSubscriptionRow): WebPushSubscription {
  return {
    endpoint: row.endpoint,
    keys: {
      p256dh: row.p256dh,
      auth: row.auth,
    },
  };
}

export async function sendPushToSubscription(
  row: PushSubscriptionRow,
  payload: PushPayload
): Promise<{ ok: boolean; expired?: boolean; error?: string }> {
  ensureVapid();

  try {
    await webpush.sendNotification(
      rowToWebPushSubscription(row),
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url ?? "/",
        tag: payload.tag ?? "squareboards",
      }),
      { TTL: 86_400 }
    );
    return { ok: true };
  } catch (err) {
    const statusCode =
      err && typeof err === "object" && "statusCode" in err
        ? Number((err as { statusCode: number }).statusCode)
        : 0;
    if (statusCode === 404 || statusCode === 410) {
      return { ok: false, expired: true };
    }
    const message = err instanceof Error ? err.message : "Push send failed.";
    return { ok: false, error: message };
  }
}

export async function broadcastPushNotifications(input: {
  subscriptions: PushSubscriptionRow[];
  payload: PushPayload;
  onExpired: (endpoint: string) => Promise<void>;
}): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const sub of input.subscriptions) {
    const result = await sendPushToSubscription(sub, input.payload);
    if (result.ok) {
      success += 1;
    } else {
      failed += 1;
      if (result.expired) {
        await input.onExpired(sub.endpoint);
      }
    }
  }

  return { success, failed };
}
