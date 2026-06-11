const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#64748b",
];

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

const INVITE_CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const INVITE_TOKEN_LENGTH = 24;

function getSecureRandomIndices(count: number): Uint32Array {
  const indices = new Uint32Array(count);
  if (typeof globalThis.crypto?.getRandomValues !== "function") {
    throw new Error("Secure random number generation is not available.");
  }
  globalThis.crypto.getRandomValues(indices);
  return indices;
}

export function generateInviteToken(): string {
  const randomValues = getSecureRandomIndices(INVITE_TOKEN_LENGTH);
  let token = "";
  for (let i = 0; i < INVITE_TOKEN_LENGTH; i++) {
    token += INVITE_CHARS[randomValues[i]! % INVITE_CHARS.length];
  }
  return token;
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export function pickColor(index: number): string {
  return COLORS[index % COLORS.length];
}

export function createEmptySquares(): import("./types").Square[] {
  return Array.from({ length: 100 }, (_, id) => ({
    id,
    claimed: false,
  }));
}

export function shuffleDigits(): number[] {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits;
}

const COPY_NUMBERED_SUFFIX = /^(.*?)\s*\(Copy\s+(\d+)\)\s*$/i;
const COPY_LEGACY_SUFFIX = /^(.*?)\s+Copy\s*$/i;

/** Next pool name when duplicating, e.g. "Pool" → "Pool (Copy 1)" → "Pool (Copy 2)". */
export function getDuplicatePoolName(sourceName: string): string {
  const trimmed = sourceName.trim();

  const numbered = trimmed.match(COPY_NUMBERED_SUFFIX);
  if (numbered) {
    const base = numbered[1].trim();
    const copyNumber = parseInt(numbered[2], 10);
    return `${base} (Copy ${copyNumber + 1})`;
  }

  const legacy = trimmed.match(COPY_LEGACY_SUFFIX);
  if (legacy) {
    return `${legacy[1].trim()} (Copy 2)`;
  }

  return `${trimmed} (Copy 1)`;
}
