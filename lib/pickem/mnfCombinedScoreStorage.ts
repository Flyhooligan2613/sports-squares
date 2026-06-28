const STORAGE_PREFIX = "pickem-mnf-combined-total";

function storageKey(contestId: string, gameId: string): string {
  return `${STORAGE_PREFIX}:${contestId}:${gameId}`;
}

export function validateCombinedScoreInput(raw: string): {
  valid: boolean;
  value?: number;
  error?: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, error: "Predict total combined score before submitting." };
  }

  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, error: "Enter a whole number (combined points for both teams)." };
  }

  const value = Number(trimmed);
  if (!Number.isInteger(value) || value < 0 || value > 200) {
    return { valid: false, error: "Combined score must be between 0 and 200." };
  }

  return { valid: true, value };
}

export function getMnfCombinedScore(
  contestId: string,
  gameId: string
): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(contestId, gameId));
    if (raw == null) return null;
    const parsed = Number(raw);
    return Number.isInteger(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function setMnfCombinedScore(
  contestId: string,
  gameId: string,
  total: number
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(contestId, gameId), String(total));
  } catch {
    /* ignore quota errors in prototype */
  }
}

export function clearMnfCombinedScore(contestId: string, gameId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(contestId, gameId));
  } catch {
    /* ignore */
  }
}
