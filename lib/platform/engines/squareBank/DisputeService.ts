import {
  findDisputeById,
  findLedgerEntryById,
  insertDispute,
  listDisputes,
  listLedgerEntries,
  updateDispute,
} from "./repository";
import type { SquareBankDisputeRecord } from "./types";

export async function openDispute(input: {
  ledgerEntryId?: string;
  playerEmail: string;
  amountCents: number;
  disputeType?: string;
  contestId?: string;
  paymentTransactionId?: string;
}): Promise<SquareBankDisputeRecord> {
  return insertDispute(input);
}

export async function getDispute(id: string): Promise<SquareBankDisputeRecord | null> {
  return findDisputeById(id);
}

export async function listOpenDisputes(limit = 50): Promise<SquareBankDisputeRecord[]> {
  const all = await listDisputes(limit);
  return all;
}

export async function resolveDispute(input: {
  disputeId: string;
  adminEmail: string;
  resolutionNotes: string;
  status?: "resolved" | "closed";
}): Promise<SquareBankDisputeRecord | null> {
  const dispute = await findDisputeById(input.disputeId);
  if (!dispute) return null;

  const now = new Date().toISOString();
  const timeline = [
    ...dispute.timeline,
    {
      at: now,
      action: "dispute_resolved",
      actor: input.adminEmail,
      note: input.resolutionNotes,
    },
  ];

  return updateDispute(input.disputeId, {
    status: input.status ?? "resolved",
    resolutionNotes: input.resolutionNotes,
    assignedAdminEmail: input.adminEmail,
    timeline,
    resolvedAt: now,
  });
}

export async function getTransactionDetail(ledgerEntryId: string) {
  const entry = await findLedgerEntryById(ledgerEntryId);
  if (!entry) return null;

  const related = await listLedgerEntries({
    playerEmail: entry.playerEmail,
    limit: 10,
  });

  return {
    entry,
    timeline: related.filter(
      (e) =>
        e.referenceId === entry.referenceId ||
        e.paymentTransactionId === entry.paymentTransactionId
    ),
    contestRef: entry.referenceType === "contest" || entry.referenceType === "pool"
      ? { type: entry.referenceType, id: entry.referenceId }
      : null,
    paymentRef: entry.paymentTransactionId,
  };
}
