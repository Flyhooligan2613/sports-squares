import { NextResponse } from "next/server";
import { PaymentEngine, PaymentError } from "@/lib/platform/engines/payment";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!PaymentEngine.isConfigured() || !isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });
  }

  try {
    const result = await PaymentEngine.processWebhook({ body, signature });

    return NextResponse.json({
      received: true,
      duplicate: result.duplicate ?? false,
    });
  } catch (err) {
    if (err instanceof PaymentError && err.code === "webhook_invalid_signature") {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    console.error("Payment webhook failed:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Webhook handler failed.",
      },
      { status: 500 }
    );
  }
}
