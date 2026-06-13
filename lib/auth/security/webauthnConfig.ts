import { getAppUrl } from "@/lib/stripe/config";

export function getWebAuthnRpId(): string {
  const configured = process.env.WEBAUTHN_RP_ID?.trim();
  if (configured) return configured;

  try {
    const host = new URL(getAppUrl()).hostname;
    return host.replace(/^www\./, "");
  } catch {
    return "localhost";
  }
}

export function getWebAuthnOrigin(): string {
  const configured = process.env.WEBAUTHN_ORIGIN?.trim();
  if (configured) return configured;
  return getAppUrl().replace(/\/$/, "");
}

export function getWebAuthnRpName(): string {
  return "SquareBoards";
}
