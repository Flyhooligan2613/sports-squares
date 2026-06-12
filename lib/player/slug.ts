import { normalizeEmail } from "@/lib/player/statsCore";

function slugBase(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  return base || "player";
}

function shortId(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i += 1) {
    hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).slice(0, 4).padStart(4, "0");
}

export function buildPlayerSlug(displayName: string, email: string): string {
  return `${slugBase(displayName)}-${shortId(normalizeEmail(email))}`;
}

export function publicProfilePath(slug: string): string {
  return `/player/${slug}`;
}

export function publicProfileUrl(slug: string, appUrl?: string): string {
  const base =
    appUrl?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${publicProfilePath(slug)}`;
}
