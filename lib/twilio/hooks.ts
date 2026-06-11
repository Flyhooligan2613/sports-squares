import { buildInviteMessage } from "@/lib/invites";

export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER
  );
}

export interface SendInviteSmsInput {
  to: string;
  poolName: string;
  inviteUrl: string;
}

/**
 * Twilio SMS hook — returns skipped until credentials are configured.
 * Wire up Twilio REST API here when enabling SMS delivery.
 */
export async function sendInviteSms(
  input: SendInviteSmsInput
): Promise<
  | { ok: true; status: "sent" }
  | { ok: true; status: "skipped"; reason: string }
  | { ok: false; error: string }
> {
  if (!isTwilioConfigured()) {
    return {
      ok: true,
      status: "skipped",
      reason: "Twilio is not configured.",
    };
  }

  const body = buildInviteMessage(input.poolName, input.inviteUrl);

  try {
    const auth = Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
    ).toString("base64");

    const params = new URLSearchParams({
      To: input.to.trim(),
      From: process.env.TWILIO_FROM_NUMBER!,
      Body: body,
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      return {
        ok: false,
        error: payload.message || `Twilio returned HTTP ${response.status}`,
      };
    }

    return { ok: true, status: "sent" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to send SMS.",
    };
  }
}
