import { ensurePlayerProfile } from "@/lib/database/services/playerProfiles";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { updateEcosystemProfile } from "@/lib/platform/ecosystem/account";
import { setPlayerAvatar } from "@/lib/platform/ecosystem/progression";
import { DEFAULT_AVATAR, isValidAvatar } from "@/lib/platform/ecosystem/avatars";
import {
  normalizePostalCode,
  validateDateOfBirth,
  validatePhone,
} from "@/lib/fraud/identity";
import { logFraudSignal } from "@/lib/fraud/signals";

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  password: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  avatarEmoji?: string;
}

export interface SignupResult {
  email: string;
  slug: string;
  authUserId: string;
}

function trim(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function validateSignupPayload(raw: Partial<SignupPayload>): {
  ok: true;
  payload: SignupPayload;
} | {
  ok: false;
  error: string;
} {
  const firstName = trim(raw.firstName);
  const lastName = trim(raw.lastName);
  const email = trim(raw.email).toLowerCase();
  const password = raw.password ?? "";
  const addressLine1 = trim(raw.addressLine1);
  const city = trim(raw.city);
  const state = trim(raw.state);
  const postalCode = normalizePostalCode(trim(raw.postalCode));

  const phoneResult = validatePhone(trim(raw.phone ?? ""));
  if (!phoneResult.ok) {
    return { ok: false, error: phoneResult.error };
  }

  const dobResult = validateDateOfBirth(trim(raw.dateOfBirth ?? ""));
  if (!dobResult.ok) {
    return { ok: false, error: dobResult.error };
  }

  if (!firstName || firstName.length < 2) {
    return { ok: false, error: "Enter your first name." };
  }
  if (!lastName || lastName.length < 2) {
    return { ok: false, error: "Enter your last name." };
  }
  if (!email || !email.includes("@") || !email.includes(".")) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  if (!addressLine1) {
    return { ok: false, error: "Enter your street address." };
  }
  if (!city) {
    return { ok: false, error: "Enter your city." };
  }
  if (!state) {
    return { ok: false, error: "Enter your state." };
  }
  if (!postalCode || postalCode.length < 5) {
    return { ok: false, error: "Enter a valid ZIP / postal code." };
  }

  return {
    ok: true,
    payload: {
      firstName,
      lastName,
      email,
      phone: phoneResult.phone,
      dateOfBirth: dobResult.dateOfBirth,
      password,
      addressLine1,
      addressLine2: trim(raw.addressLine2) || undefined,
      city,
      state,
      postalCode,
      avatarEmoji: raw.avatarEmoji,
    },
  };
}

export async function registerPlayerAccount(
  payload: SignupPayload,
  audit?: { ipAddress?: string | null }
): Promise<SignupResult> {
  const email = normalizeEmail(payload.email);
  const displayName = `${payload.firstName} ${payload.lastName}`.trim();
  const supabase = getSupabaseAdmin();

  const { data: existingProfile } = await supabase
    .from("player_profiles")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile?.email) {
    await logFraudSignal({
      signalType: "duplicate_email_signup",
      playerEmail: email,
      ipAddress: audit?.ipAddress ?? null,
    });
    throw new Error("An account with this email already exists. Sign in instead.");
  }

  const { data: existingPhone } = await supabase
    .from("player_profiles")
    .select("email")
    .eq("phone", payload.phone)
    .maybeSingle();

  if (existingPhone?.email) {
    await logFraudSignal({
      signalType: "duplicate_phone_signup",
      playerEmail: email,
      ipAddress: audit?.ipAddress ?? null,
      metadata: { conflictingEmail: existingPhone.email },
    });
    throw new Error("An account with this phone number already exists. Sign in instead.");
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: payload.password,
    email_confirm: true,
    user_metadata: {
      first_name: payload.firstName,
      last_name: payload.lastName,
    },
  });

  if (createError || !created.user) {
    const message = createError?.message ?? "Could not create account.";
    if (/already|registered|exists/i.test(message)) {
      throw new Error("An account with this email already exists. Sign in instead.");
    }
    throw new Error(message);
  }

  const slug = await ensurePlayerProfile(email, displayName);
  if (!slug) {
    await supabase.auth.admin.deleteUser(created.user.id);
    throw new Error("Could not create your player profile.");
  }

  try {
    await updateEcosystemProfile(email, {
      first_name: payload.firstName,
      last_name: payload.lastName,
      display_name: displayName,
      phone: payload.phone,
      date_of_birth: payload.dateOfBirth,
      address_line1: payload.addressLine1,
      address_line2: payload.addressLine2 ?? null,
      city: payload.city,
      state: payload.state,
      postal_code: payload.postalCode,
    });
  } catch (err) {
    await supabase.auth.admin.deleteUser(created.user.id);
    const message = err instanceof Error ? err.message : String(err);
    if (/phone|unique|duplicate/i.test(message)) {
      throw new Error("An account with this phone number already exists. Sign in instead.");
    }
    throw err;
  }

  const avatar = isValidAvatar(payload.avatarEmoji ?? "")
    ? payload.avatarEmoji!
    : DEFAULT_AVATAR;
  await setPlayerAvatar(email, avatar);

  const { initializeGenesisAccount } = await import("@/lib/platform/engines/genesis");
  await initializeGenesisAccount(email).catch(() => undefined);

  const { SquarePassEngine } = await import("@/lib/platform/engines/squarePass");
  await SquarePassEngine.ensurePersonalCode(email).catch(() => undefined);
  await SquarePassEngine.processSignupBonuses(email).catch(() => undefined);

  const { SquareWalletEngine } = await import("@/lib/platform/engines/payment/wallet");
  await SquareWalletEngine.ensureWallet(email).catch(() => undefined);

  const { SquareBankEngine } = await import("@/lib/platform/engines/squareBank");
  await SquareBankEngine.ensureAccount(email).catch(() => undefined);

  return {
    email,
    slug,
    authUserId: created.user.id,
  };
}
