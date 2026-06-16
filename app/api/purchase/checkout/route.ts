import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PURCHASE_TYPE_SQUARES } from "@/lib/platform/core/checkoutMetadata";
import { normalizeEntryTierCents } from "@/lib/platform/core/entryTiers";
import { getSupabaseConfig } from "@/lib/supabase";
import { requirePlayEligible } from "@/lib/payments/requirePlayEligible";
import { normalizeEmail, displayNameFromEmail } from "@/lib/player/statsCore";
import { PaymentEngine, getAppUrl } from "@/lib/platform/engines/payment";

type CheckoutPool = {
  id: string;
  name: string;
  status: string;
  cost_per_square: number;
  entry_tier_cents: number | null;
};

async function fetchCheckoutPool(poolId: string): Promise<CheckoutPool | null> {
  const { url, publishableKey } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/pools?select=id,name,status,cost_per_square,entry_tier_cents&id=eq.${encodeURIComponent(poolId)}`,
    {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Supabase pool lookup failed (${response.status})`);
  }

  const rows = (await response.json()) as CheckoutPool[];
  return rows[0] ?? null;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  noStore();
  const missing = PaymentEngine.getMissingConfig();
  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: `Checkout is not configured. Missing: ${missing.join(", ")}`,
      },
      { status: 503 }
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json(
        { error: "Sign in and set up your cash-out account before purchasing squares." },
        { status: 401 }
      );
    }

    const eligibilityError = await requirePlayEligible(user.email);
    if (eligibilityError) return eligibilityError;

    const body = (await request.json()) as {
      poolId?: string;
      name?: string;
      email?: string;
      phone?: string;
      squaresCount?: number;
    };

    const poolId = body.poolId?.trim();
    const name = body.name?.trim() || displayNameFromEmail(user.email);
    const email = normalizeEmail(user.email);
    const phone = body.phone?.trim() || undefined;
    const squaresCount = Number(body.squaresCount);

    if (!poolId || !name) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(squaresCount) || squaresCount < 1 || squaresCount > 100) {
      return NextResponse.json(
        { error: "Squares must be between 1 and 100." },
        { status: 400 }
      );
    }

    const pool = await fetchCheckoutPool(poolId);

    if (!pool) {
      return NextResponse.json({ error: "Pool not found." }, { status: 404 });
    }

    if (pool.status !== "open") {
      return NextResponse.json(
        { error: "This board is not open for purchases." },
        { status: 400 }
      );
    }

    const costPerSquare = Number(pool.cost_per_square ?? 0);
    if (costPerSquare <= 0) {
      return NextResponse.json(
        { error: "This board does not have pricing configured yet." },
        { status: 400 }
      );
    }

    const entryTierCents = normalizeEntryTierCents(pool.entry_tier_cents);
    const expectedCost = entryTierCents / 100;
    if (Math.abs(costPerSquare - expectedCost) > 0.001) {
      return NextResponse.json(
        { error: "Board pricing does not match entry tier." },
        { status: 400 }
      );
    }

    const { url, publishableKey } = getSupabaseConfig();
    const squaresResponse = await fetch(
      `${url}/rest/v1/squares?select=id&pool_id=eq.${encodeURIComponent(poolId)}&claimed=eq.false`,
      {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${publishableKey}`,
          Prefer: "count=exact",
        },
        cache: "no-store",
      }
    );

    if (!squaresResponse.ok) {
      return NextResponse.json(
        { error: "Could not verify square availability." },
        { status: 503 }
      );
    }

    const availableHeader = squaresResponse.headers.get("content-range");
    const availableCount = availableHeader
      ? Number(availableHeader.split("/")[1] ?? 0)
      : 0;

    if (availableCount < squaresCount) {
      return NextResponse.json(
        {
          error:
            availableCount <= 0
              ? "This board is sold out. Choose another open board for this game."
              : `Only ${availableCount} square${availableCount === 1 ? "" : "s"} remain on this board.`,
        },
        { status: 400 }
      );
    }

    const unitAmount = Math.round(costPerSquare * 100);
    const appUrl = getAppUrl();

    const result = await PaymentEngine.deposit({
      email,
      amountCents: unitAmount * squaresCount,
      description: `${pool.name} — Sports Square`,
      successUrl: `${appUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/pool/${poolId}`,
      setupFutureUsage: true,
      lineItems: [
        {
          name: `${pool.name} — Sports Square`,
          description: `${squaresCount} square${squaresCount === 1 ? "" : "s"} at $${costPerSquare.toFixed(2)} each`,
          unitAmountCents: unitAmount,
          quantity: squaresCount,
        },
      ],
      metadata: {
        purchaseType: PURCHASE_TYPE_SQUARES,
        poolId,
        name,
        email,
        phone: phone ?? "",
        squaresCount: String(squaresCount),
        entryTierCents: String(entryTierCents),
      },
    });

    if (!result.ok || !result.checkoutUrl) {
      return NextResponse.json(
        { error: result.error?.userMessage ?? "Could not create checkout session." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: result.checkoutUrl, sessionId: result.sessionId });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to create checkout session.",
      },
      { status: 500 }
    );
  }
}
