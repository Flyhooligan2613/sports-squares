const PIN_STORAGE_PREFIX = "sb-quick-pin:";
const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

interface PinRecord {
  salt: string;
  hash: string;
  failedAttempts: number;
  lockedUntil: number | null;
}

function pinKey(email: string): string {
  return `${PIN_STORAGE_PREFIX}${email.trim().toLowerCase()}`;
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hashPin(pin: string, salt: Uint8Array): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: 120_000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return toBase64(derived);
}

function readRecord(email: string): PinRecord | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(pinKey(email));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PinRecord;
  } catch {
    return null;
  }
}

function writeRecord(email: string, record: PinRecord): void {
  localStorage.setItem(pinKey(email), JSON.stringify(record));
}

export function isValidPinFormat(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function isQuickPinEnabledLocally(email: string): boolean {
  return Boolean(readRecord(email));
}

export function isQuickPinLocked(email: string): boolean {
  const record = readRecord(email);
  if (!record?.lockedUntil) return false;
  if (Date.now() >= record.lockedUntil) {
    writeRecord(email, { ...record, lockedUntil: null, failedAttempts: 0 });
    return false;
  }
  return true;
}

export async function setupQuickPin(email: string, pin: string): Promise<void> {
  if (!isValidPinFormat(pin)) throw new Error("PIN must be exactly 4 digits.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await hashPin(pin, salt);
  writeRecord(email, {
    salt: toBase64(salt.buffer),
    hash,
    failedAttempts: 0,
    lockedUntil: null,
  });
}

export async function verifyQuickPin(email: string, pin: string): Promise<boolean> {
  if (!isValidPinFormat(pin)) return false;
  const record = readRecord(email);
  if (!record) return false;
  if (isQuickPinLocked(email)) {
    throw new Error("Quick PIN locked. Use email or biometrics to sign in.");
  }

  const hash = await hashPin(pin, fromBase64(record.salt));
  if (hash === record.hash) {
    writeRecord(email, { ...record, failedAttempts: 0, lockedUntil: null });
    return true;
  }

  const failedAttempts = record.failedAttempts + 1;
  const lockedUntil = failedAttempts >= MAX_PIN_ATTEMPTS ? Date.now() + LOCKOUT_MS : null;
  writeRecord(email, { ...record, failedAttempts, lockedUntil });
  if (lockedUntil) {
    throw new Error("Too many incorrect PIN attempts. Quick PIN disabled temporarily.");
  }
  return false;
}

export function clearQuickPin(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(pinKey(email));
}

export function getQuickPinFailedAttempts(email: string): number {
  return readRecord(email)?.failedAttempts ?? 0;
}
