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
};

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
