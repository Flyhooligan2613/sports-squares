export type AuthSuccessKind =
  | "account_created"
  | "login_success"
  | "email_verified"
  | "profile_updated"
  | "password_updated";

export const AUTH_SUCCESS_EVENT = "sb-auth-success";

export interface AuthSuccessDetail {
  kind: AuthSuccessKind;
  message?: string;
}

const MESSAGES: Record<AuthSuccessKind, { title: string; body: string; emoji: string }> = {
  account_created: {
    title: "Account created",
    body: "Welcome to SquareBoards — your player profile is ready.",
    emoji: "🎉",
  },
  login_success: {
    title: "Signed in",
    body: "Welcome back — your session is secure on this device.",
    emoji: "✓",
  },
  email_verified: {
    title: "Email verified",
    body: "You're all set — explore contests and build your legacy.",
    emoji: "✉️",
  },
  profile_updated: {
    title: "Profile updated",
    body: "Your changes are saved and visible across the platform.",
    emoji: "⭐",
  },
  password_updated: {
    title: "Password updated",
    body: "Your new password is active — keep it somewhere safe.",
    emoji: "🔒",
  },
};

export function showAuthSuccess(kind: AuthSuccessKind, message?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AuthSuccessDetail>(AUTH_SUCCESS_EVENT, {
      detail: { kind, message },
    })
  );
}

export function resolveAuthSuccessCopy(kind: AuthSuccessKind, message?: string) {
  const preset = MESSAGES[kind];
  return {
    title: preset.title,
    body: message ?? preset.body,
    emoji: preset.emoji,
  };
}

const AUTH_QUERY_MAP: Record<string, AuthSuccessKind> = {
  account_created: "account_created",
  login: "login_success",
  email_verified: "email_verified",
  profile_updated: "profile_updated",
  password_updated: "password_updated",
};

/** Consume `?auth=` query param and fire success toast once. */
export function consumeAuthSuccessFromUrl(): AuthSuccessKind | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const auth = params.get("auth")?.trim();
  if (!auth || !AUTH_QUERY_MAP[auth]) return null;

  params.delete("auth");
  const next = params.toString();
  const path = window.location.pathname;
  window.history.replaceState({}, "", next ? `${path}?${next}` : path);

  const kind = AUTH_QUERY_MAP[auth];
  showAuthSuccess(kind);
  return kind;
}
