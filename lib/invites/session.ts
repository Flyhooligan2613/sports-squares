const STORAGE_KEY = "sports-squares-invite-sessions";

export interface InviteSession {
  poolId: string;
  playerId: string;
  inviteToken: string;
  savedAt: number;
}

type InviteSessionMap = Record<string, InviteSession>;

function readSessions(): InviteSessionMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as InviteSessionMap;
  } catch {
    return {};
  }
}

function writeSessions(sessions: InviteSessionMap): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function storeInviteSession(
  poolId: string,
  playerId: string,
  inviteToken: string
): void {
  const sessions = readSessions();
  sessions[poolId] = {
    poolId,
    playerId,
    inviteToken,
    savedAt: Date.now(),
  };
  writeSessions(sessions);
}

export function getInviteSession(poolId: string): InviteSession | null {
  const session = readSessions()[poolId];
  return session ?? null;
}

export function listInviteSessions(): InviteSession[] {
  return Object.values(readSessions());
}

export function clearInviteSession(poolId: string): void {
  const sessions = readSessions();
  delete sessions[poolId];
  writeSessions(sessions);
}
