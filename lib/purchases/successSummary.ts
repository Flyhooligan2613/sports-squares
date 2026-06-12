export interface PurchaseSuccessSummary {
  email: string;
  homeTeam: string;
  awayTeam: string;
  boardIndex: number;
  squaresPurchased: number;
  totalPaid: number;
  kickoffAt: string | null;
  kickoffLabel: string;
}

export function formatPurchaseKickoff(kickoffAt: string | null): string {
  if (!kickoffAt) return "TBD";

  const date = new Date(kickoffAt);
  if (Number.isNaN(date.getTime())) return "TBD";

  return date.toLocaleString(undefined, {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}
