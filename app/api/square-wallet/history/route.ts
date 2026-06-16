import { NextResponse } from "next/server";
import { SquareWalletEngine } from "@/lib/platform/engines/payment/wallet";
import { getSquareWalletAuthorizedEmail } from "@/lib/platform/engines/payment/wallet/apiAuth";
import type {
  WalletHistoryCategory,
  WalletTransactionTypeFilter,
} from "@/lib/platform/engines/payment/wallet/ledgerCategories";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES: WalletHistoryCategory[] = [
  "all",
  "deposits",
  "withdrawals",
  "contest_bets",
  "wins",
  "losses",
];

export async function GET(request: Request) {
  const email = await getSquareWalletAuthorizedEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0));
  const search = searchParams.get("search") ?? undefined;
  const categoryParam = searchParams.get("category") as WalletHistoryCategory | null;
  const typeParam = searchParams.get("type") as WalletTransactionTypeFilter | null;

  const category =
    categoryParam && VALID_CATEGORIES.includes(categoryParam) ? categoryParam : "all";

  const { entries, total } = await SquareWalletEngine.listTransactions({
    email,
    limit,
    offset,
    search,
    category: category === "all" ? undefined : category,
    type: typeParam ?? undefined,
  });

  return NextResponse.json({ entries, total, limit, offset, category });
}
