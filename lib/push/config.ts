/** Web Push (VAPID) configuration — set in Vercel + .env.local. */

export function getVapidPublicKey(): string | null {
  return (
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ??
    process.env.VAPID_PUBLIC_KEY?.trim() ??
    null
  );
}

export function isPushConfigured(): boolean {
  return Boolean(
    getVapidPublicKey() &&
      process.env.VAPID_PRIVATE_KEY?.trim() &&
      process.env.VAPID_SUBJECT?.trim()
  );
}

export function getVapidSubject(): string {
  return process.env.VAPID_SUBJECT?.trim() ?? "mailto:support@squareboards.pro";
}
