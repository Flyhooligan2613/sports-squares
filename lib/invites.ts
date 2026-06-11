export function buildInvitePath(inviteToken: string): string {
  return `/join/${inviteToken}`;
}

export function buildInviteUrl(inviteToken: string): string {
  if (typeof window === "undefined") return buildInvitePath(inviteToken);
  return `${window.location.origin}${buildInvitePath(inviteToken)}`;
}

export function buildInviteMessage(poolName: string, inviteUrl: string): string {
  return `You're invited to ${poolName}! Select your squares here: ${inviteUrl}`;
}

export function normalizePhoneForSms(phone: string): string {
  return phone.trim().replace(/[^\d+]/g, "");
}

export function buildSmsLink(phone: string, body: string): string {
  const normalized = normalizePhoneForSms(phone);
  return `sms:${normalized}?body=${encodeURIComponent(body)}`;
}

export function buildMailtoLink(
  email: string,
  subject: string,
  body: string
): string {
  return `mailto:${email.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
