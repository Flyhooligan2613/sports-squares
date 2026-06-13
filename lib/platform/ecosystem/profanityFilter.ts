/**
 * Content moderation for usernames and bios.
 * Blocks derogatory / hateful language while allowing creative emoji names.
 */

const BLOCKED_TERMS = [
  "fuck",
  "fuk",
  "fck",
  "shit",
  "bitch",
  "bastard",
  "asshole",
  "dick",
  "pussy",
  "cunt",
  "nigger",
  "nigga",
  "faggot",
  "fag",
  "retard",
  "whore",
  "slut",
  "rape",
  "nazi",
  "hitler",
  "kike",
  "spic",
  "chink",
  "tranny",
  "dyke",
];

const BLOCKED_PATTERNS = [
  /\bn+\s*i+\s*g+\s*g+/i,
  /\bf+\s*a+\s*g+/i,
  /\bk+\s*i+\s*k+\s*e+/i,
];

export interface ModerationResult {
  ok: boolean;
  reason?: string;
}

function normalizeForScan(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[$5]/g, "s")
    .replace(/[7+]/g, "t")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function scanTextForProfanity(text: string): ModerationResult {
  const normalized = normalizeForScan(text);
  if (!normalized) return { ok: true };

  for (const term of BLOCKED_TERMS) {
    const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(normalized) || normalized.includes(term)) {
      return {
        ok: false,
        reason: "Please keep language respectful — remove offensive words and try again.",
      };
    }
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        ok: false,
        reason: "Please keep language respectful — remove offensive words and try again.",
      };
    }
  }

  return { ok: true };
}

export function validateUsername(raw: string): ModerationResult & { value?: string } {
  const value = raw.trim().replace(/[<>\n\r\t]/g, "").slice(0, 24);
  if (value.length < 3) {
    return { ok: false, reason: "Username must be at least 3 characters." };
  }

  if (/[<>\n\r\t\\]/.test(value)) {
    return { ok: false, reason: "Username contains invalid characters." };
  }

  const scan = scanTextForProfanity(value);
  if (!scan.ok) return scan;

  return { ok: true, value };
}

export function validateProfileBio(raw: string): ModerationResult & { value?: string } {
  const value = raw.trim().replace(/[<>\n\r\t]/g, "").slice(0, 120);
  if (!value) return { ok: true, value: "" };

  const scan = scanTextForProfanity(value);
  if (!scan.ok) return scan;

  return { ok: true, value };
}
