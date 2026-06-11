import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { getAppUrl, getCheckoutMissingConfig } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/client";
import { getSupabaseConfig } from "@/lib/supabase";

type CheckoutPool = {
  id: string;
  name: string;
  status: string;
  cost_per_square: number;
};

async function fetchCheckoutPool(poolId: string): Promise<CheckoutPool | null> {
  const { url, publishableKey } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/pools?select=id,name,status,cost_per_square&id=eq.${encodeURIComponent(poolId)}`,
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
  const missing = getCheckoutMissingConfig();
  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: `Checkout is not configured. Add to .env.local: ${missing.join(", ")}`,
      },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      poolId?: string;
      name?: string;
      email?: string;
      phone?: string;
      squaresCount?: number;
    };

    const poolId = body.poolId?.trim();
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim() || undefined;
    const squaresCount = Number(body.squaresCount);

    if (!poolId || !name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
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
        { error: "This pool is not open for purchases." },
        { status: 400 }
      );
    }

    const costPerSquare = Number(pool.cost_per_square ?? 0);
    if (costPerSquare <= 0) {
      return NextResponse.json(
        { error: "This pool does not have pricing configured yet." },
        { status: 400 }
      );
    }

    const unitAmount = Math.round(costPerSquare * 100);
    const appUrl = getAppUrl();
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: unitAmount,
            product_data: {
              name: `${pool.name} — Sports Square`,
              description: `${squaresCount} square${squaresCount === 1 ? "" : "s"} at $${costPerSquare.toFixed(2)} each`,
            },
          },
          quantity: squaresCount,
        },
      ],
      success_url: `${appUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pool/${poolId}`,
      metadata: {
        poolId,
        name,
        email,
        phone: phone ?? "",
        squaresCount: String(squaresCount),
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not create checkout session." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
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
