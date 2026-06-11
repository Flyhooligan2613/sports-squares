import { enrichParticipantFinancials } from "./poolFinance";
import type { Participant, Pool } from "./types";

export function countSquaresOwned(pool: Pool, playerId: string): number {
  return pool.squares.filter((s) => s.owner?.id === playerId).length;
}

export function syncParticipantCredits(
  participant: Participant,
  squaresOwned: number
): Participant {
  const creditsUsed = squaresOwned;
  const creditsRemaining = participant.creditsPurchased - creditsUsed;
  return {
    ...participant,
    creditsUsed,
    creditsRemaining,
  };
}

export function normalizeParticipant(
  participant: Participant,
  pool: Pool
): Participant {
  const squaresOwned = countSquaresOwned(pool, participant.id);
  const creditsPurchased = participant.creditsPurchased ?? 0;
  const base = { ...participant, creditsPurchased };
  const synced = syncParticipantCredits(base, squaresOwned);
  return enrichParticipantFinancials(synced, pool);
}

export function normalizePoolParticipants(pool: Pool): Pool {
  pool.participants = pool.participants.map((p) =>
    normalizeParticipant(p, pool)
  );
  return pool;
}

export function createParticipantWithCredits(
  name: string,
  creditsPurchased: number,
  contact?: { email?: string; phone?: string }
): Participant {
  const trimmed = name.trim();
  const email = contact?.email?.trim() || undefined;
  const phone = contact?.phone?.trim() || undefined;
  return {
    id: Math.random().toString(36).slice(2, 10),
    name: trimmed,
    initials: trimmed
      .split(/\s+/)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2),
    creditsPurchased,
    creditsUsed: 0,
    creditsRemaining: creditsPurchased,
    amountPaid: 0,
    paymentStatus: "unpaid",
    email,
    phone,
    inviteDeliveryStatus: email ? "pending" : "skipped",
    smsDeliveryStatus: phone ? "pending" : "skipped",
    purchaseSource: "manual",
  };
}
