import { sendSecurityNotificationEmail } from "@/lib/email/resend";
import {
  markSecurityEventNotified,
  recordSecurityEvent,
  type SecurityEventType,
} from "@/lib/auth/security/db";

const LABELS: Record<SecurityEventType, { subject: string; title: string; body: string }> = {
  new_device_login: {
    subject: "New sign-in to SquareBoards",
    title: "New device signed in",
    body: "A new device just signed in to your SquareBoards account.",
  },
  email_change: {
    subject: "Your SquareBoards email was changed",
    title: "Email address updated",
    body: "The email address on your SquareBoards account was changed.",
  },
  payout_change: {
    subject: "Payout settings updated on SquareBoards",
    title: "Payout details changed",
    body: "Your payout account or payout settings were updated.",
  },
  password_change: {
    subject: "SquareBoards account security update",
    title: "Password changed",
    body: "Your account password was changed.",
  },
  unusual_login: {
    subject: "Unusual sign-in activity on SquareBoards",
    title: "Unusual sign-in detected",
    body: "We detected sign-in activity that looks unusual for your account.",
  },
  sign_out_all: {
    subject: "Signed out of all SquareBoards devices",
    title: "Signed out everywhere",
    body: "All trusted devices were signed out of your SquareBoards account.",
  },
  device_revoked: {
    subject: "A device was removed from SquareBoards",
    title: "Trusted device removed",
    body: "A trusted device was removed from your account.",
  },
  biometric_enabled: {
    subject: "Biometric login enabled on SquareBoards",
    title: "Biometric login enabled",
    body: "Biometric login was enabled on one of your devices.",
  },
  biometric_login: {
    subject: "SquareBoards sign-in",
    title: "Biometric login",
    body: "You signed in with biometrics.",
  },
  pin_enabled: {
    subject: "Quick PIN enabled on SquareBoards",
    title: "Quick PIN enabled",
    body: "A 4-digit Quick Unlock PIN was enabled on your device.",
  },
  pin_login: {
    subject: "SquareBoards unlock",
    title: "Quick PIN unlock",
    body: "Your account was unlocked with Quick PIN.",
  },
  pin_locked: {
    subject: "Quick PIN locked on SquareBoards",
    title: "Quick PIN temporarily locked",
    body: "Quick PIN was locked after too many failed attempts.",
  },
  purchase_confirmed: {
    subject: "SquareBoards purchase confirmed",
    title: "Purchase confirmed",
    body: "A purchase was confirmed on your account.",
  },
  profile_update: {
    subject: "SquareBoards profile updated",
    title: "Profile updated",
    body: "Your profile information was updated.",
  },
  phone_change: {
    subject: "SquareBoards phone updated",
    title: "Phone number updated",
    body: "The phone number on your account was updated.",
  },
  session_revoked: {
    subject: "SquareBoards session ended",
    title: "Session revoked",
    body: "An active session was revoked on your account.",
  },
  device_acknowledged: {
    subject: "SquareBoards device confirmed",
    title: "Device confirmed",
    body: "You confirmed a new device sign-in.",
  },
  account_secured: {
    subject: "SquareBoards account secured",
    title: "Account secured",
    body: "You secured your account after a new device alert.",
  },
};

const SILENT_EVENTS = new Set<SecurityEventType>([
  "biometric_login",
  "pin_login",
]);

export async function notifySecurityEvent(input: {
  email: string;
  eventType: SecurityEventType;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const eventId = await recordSecurityEvent({
    email: input.email,
    eventType: input.eventType,
    metadata: input.metadata ?? {},
  });

  const copy = LABELS[input.eventType];
  if (!copy || SILENT_EVENTS.has(input.eventType)) {
    return;
  }

  const metaLines = Object.entries(input.metadata ?? {})
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}: ${String(value)}`);

  const result = await sendSecurityNotificationEmail({
    to: input.email,
    subject: copy.subject,
    title: copy.title,
    body: copy.body,
    details: metaLines,
  });

  if (result.ok) {
    await markSecurityEventNotified(eventId);
  }
}
