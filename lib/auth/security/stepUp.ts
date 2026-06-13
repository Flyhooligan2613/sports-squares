import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import {
  consumeStepUpToken,
  saveStepUpToken,
} from "@/lib/auth/security/db";
import { createStepUpToken, hashStepUpToken } from "@/lib/auth/security/deviceClient";

export type StepUpPurpose =
  | "payout_change"
  | "email_change"
  | "account_delete"
  | "view_financials"
  | "purchase"
  | "profile_update"
  | "password_change"
  | "phone_change";

const STEP_UP_TTL_MS = 15 * 60 * 1000;

export async function issueStepUpToken(email: string, purpose: StepUpPurpose): Promise<string> {
  const token = createStepUpToken();
  await saveStepUpToken({
    email,
    tokenHash: hashStepUpToken(token),
    purpose,
    expiresAt: new Date(Date.now() + STEP_UP_TTL_MS),
  });
  return token;
}

export async function validateStepUpToken(
  email: string,
  purpose: StepUpPurpose,
  token: string | null | undefined
): Promise<boolean> {
  if (!token?.trim()) return false;
  return consumeStepUpToken(hashStepUpToken(token.trim()), email, purpose);
}

export async function requireStepUpFromRequest(
  request: Request,
  purpose: StepUpPurpose
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { ok: false, error: "Unauthorized" };
  }

  const token = request.headers.get("x-step-up-token");
  const valid = await validateStepUpToken(user.email, purpose, token);
  if (!valid) {
    return {
      ok: false,
      error: "Confirm your identity with biometrics or re-authentication before continuing.",
    };
  }

  return { ok: true, email: user.email };
}

export function hashDeviceKey(deviceKey: string): string {
  return createHash("sha256").update(deviceKey).digest("hex").slice(0, 16);
}
