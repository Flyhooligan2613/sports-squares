import { buildInviteMessage } from "@/lib/invites";

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export interface SendInviteEmailInput {
  to: string;
  poolName: string;
  creditsPurchased: number;
  inviteUrl: string;
}

export interface SendPlayerSignInEmailInput {
  to: string;
  signInUrl: string;
}

export async function sendPlayerSignInEmail(
  input: SendPlayerSignInEmailInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isResendConfigured()) {
    return { ok: false, error: "Email delivery is not configured." };
  }

  const to = input.to.trim();

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [to],
        subject: "Sign in to SquareBoards",
        html: `
          <p>Tap the button below to open <strong>My Games</strong> and view your boards.</p>
          <p style="margin:24px 0;">
            <a href="${input.signInUrl}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:600;">
              Sign in to My Games
            </a>
          </p>
          <p style="color:#666;font-size:12px;">This link expires soon and can only be used once. If you did not request it, you can ignore this email.</p>
          <p style="color:#666;font-size:12px;word-break:break-all;">${escapeHtml(input.signInUrl)}</p>
        `,
        text: `Sign in to SquareBoards My Games:\n\n${input.signInUrl}\n\nThis link expires soon and can only be used once.`,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        message?: string | string[];
        error?: string;
      };
      const detail =
        typeof payload.message === "string"
          ? payload.message
          : Array.isArray(payload.message)
            ? payload.message.join(", ")
            : payload.error;
      return {
        ok: false,
        error: detail || `Resend returned HTTP ${response.status}`,
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to send email.",
    };
  }
}

export async function sendInviteEmail(
  input: SendInviteEmailInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isResendConfigured()) {
    return { ok: false, error: "Resend is not configured." };
  }

  const body = buildInviteMessage(input.poolName, input.inviteUrl);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [input.to.trim()],
        subject: `Your invite to ${input.poolName}`,
        html: `
          <p>You're invited to <strong>${escapeHtml(input.poolName)}</strong>!</p>
          <p>You purchased <strong>${input.creditsPurchased}</strong> square${input.creditsPurchased === 1 ? "" : "s"}.</p>
          <p><a href="${input.inviteUrl}">Select your squares here</a></p>
          <p style="color:#666;font-size:12px;">${escapeHtml(body)}</p>
        `,
        text: `${body}\n\nCredits purchased: ${input.creditsPurchased}`,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        message?: string | string[];
        error?: string;
      };
      const detail =
        typeof payload.message === "string"
          ? payload.message
          : Array.isArray(payload.message)
            ? payload.message.join(", ")
            : payload.error;
      return {
        ok: false,
        error: detail || `Resend returned HTTP ${response.status}`,
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to send email.",
    };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
