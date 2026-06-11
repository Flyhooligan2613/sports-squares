"use client";

const INVITE_TOKEN_PATTERN = /^[a-zA-Z0-9]{24}$/;

export function parseJoinInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    if (trimmed.includes("/join/")) {
      const url = trimmed.startsWith("http")
        ? new URL(trimmed)
        : new URL(trimmed, "https://placeholder.local");
      const segment = url.pathname.split("/join/")[1]?.split("/")[0];
      if (segment) return `/join/${segment}`;
    }
    if (trimmed.includes("/pool/")) {
      const url = trimmed.startsWith("http")
        ? new URL(trimmed)
        : new URL(trimmed, "https://placeholder.local");
      const segment = url.pathname.split("/pool/")[1]?.split("/")[0];
      if (segment) return `/pool/${segment}`;
    }
  } catch {
    /* fall through */
  }

  if (INVITE_TOKEN_PATTERN.test(trimmed)) {
    return `/join/${trimmed}`;
  }

  return null;
}

export function normalizePoolCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s/g, "");
}
