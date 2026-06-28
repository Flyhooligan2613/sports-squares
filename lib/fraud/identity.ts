/** Normalize US phone to 10 digits (no country code). */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }
  return digits;
}

export function validatePhone(raw: string): { ok: true; phone: string } | { ok: false; error: string } {
  const phone = normalizePhone(raw);
  if (phone.length !== 10) {
    return { ok: false, error: "Enter a valid 10-digit US phone number." };
  }
  if (phone[0] === "0" || phone[0] === "1") {
    return { ok: false, error: "Enter a valid US phone number." };
  }
  return { ok: true, phone };
}

export function formatPhoneDisplay(phone: string): string {
  const digits = normalizePhone(phone);
  if (digits.length !== 10) return phone;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** US ZIP — compare first 5 digits only (ZIP+4 allowed on file). */
export function normalizePostalCode(raw: string): string {
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, "");
  const match = cleaned.match(/^(\d{5})(?:-?(\d{4}))?$/);
  if (match) {
    return match[2] ? `${match[1]}-${match[2]}` : match[1];
  }
  const digits = cleaned.replace(/\D/g, "");
  return digits.slice(0, 5);
}

export function postalCodesMatch(onFile: string, billing: string): boolean {
  const a = normalizePostalCode(onFile).slice(0, 5);
  const b = normalizePostalCode(billing).slice(0, 5);
  return a.length === 5 && b.length === 5 && a === b;
}

export function validateDateOfBirth(
  raw: string,
  minAgeYears = 21
): { ok: true; dateOfBirth: string } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { ok: false, error: "Enter your date of birth (YYYY-MM-DD)." };
  }

  const dob = new Date(`${trimmed}T12:00:00.000Z`);
  if (Number.isNaN(dob.getTime())) {
    return { ok: false, error: "Enter a valid date of birth." };
  }

  const today = new Date();
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - dob.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < dob.getUTCDate())) {
    age -= 1;
  }

  if (age < minAgeYears) {
    return {
      ok: false,
      error: `You must be at least ${minAgeYears} years old to create an account.`,
    };
  }

  if (age > 120) {
    return { ok: false, error: "Enter a valid date of birth." };
  }

  return { ok: true, dateOfBirth: trimmed };
}
