import {
  bankBalancesFromRows,
  computeBankSpendableCents,
  computeBankWithdrawableCents,
  emptyBankBalances,
} from "./balanceMapping";
import { fetchBalanceRows, getBalanceCents, updateBalanceCents } from "./repository";
import type { SquareBankAccountType, SquareBankBalances, SquareBankDirection } from "./types";

export async function getAccountBalances(accountId: string): Promise<SquareBankBalances> {
  const rows = await fetchBalanceRows(accountId);
  return bankBalancesFromRows(rows);
}

export async function applyBalanceDelta(input: {
  accountId: string;
  accountType: SquareBankAccountType;
  direction: SquareBankDirection;
  amountCents: number;
}): Promise<{ beforeCents: number; afterCents: number }> {
  const beforeCents = await getBalanceCents(input.accountId, input.accountType);
  const delta = input.direction === "credit" ? input.amountCents : -input.amountCents;
  const afterCents = beforeCents + delta;

  if (afterCents < 0) {
    throw new Error(`Insufficient ${input.accountType} balance.`);
  }

  await updateBalanceCents({
    accountId: input.accountId,
    accountType: input.accountType,
    amountCents: afterCents,
  });

  return { beforeCents, afterCents };
}

export { computeBankSpendableCents, computeBankWithdrawableCents, emptyBankBalances };
