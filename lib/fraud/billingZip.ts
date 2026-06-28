import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/database/config";
import { normalizeEmail } from "@/lib/player/statsCore";
import { postalCodesMatch } from "@/lib/fraud/identity";
import { logFraudSignal } from "@/lib/fraud/signals";

export class BillingZipMismatchError extends Error {
  constructor() {
    super(
      "Your card billing ZIP must match the ZIP on your SquareBoards account. Update your profile or use a card billed to that address."
    );
    this.name = "BillingZipMismatchError";
  }
}

export async function getProfilePostalCode(email: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from(TABLES.playerProfiles)
    .select("postal_code")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  return (data?.postal_code as string | null) ?? null;
}

export async function assertBillingZipMatchesProfile(input: {
  email: string;
  billingPostalCode: string | null | undefined;
  ipAddress?: string | null;
}): Promise<void> {
  const onFile = await getProfilePostalCode(input.email);
  if (!onFile?.trim()) {
    throw new Error("Complete your mailing address on your profile before making a payment.");
  }

  const billing = input.billingPostalCode?.trim();
  if (!billing) {
    throw new Error("A billing ZIP code is required for this payment.");
  }

  if (!postalCodesMatch(onFile, billing)) {
    await logFraudSignal({
      signalType: "billing_zip_mismatch",
      playerEmail: input.email,
      ipAddress: input.ipAddress ?? null,
      metadata: {
        onFileZipPrefix: onFile.slice(0, 5),
        billingZipPrefix: billing.slice(0, 5),
      },
    });
    throw new BillingZipMismatchError();
  }
}

/** Extract billing postal from Stripe Checkout session customer details. */
export function billingPostalFromCheckoutSession(session: {
  customer_details?: { address?: { postal_code?: string | null } | null } | null;
}): string | null {
  return session.customer_details?.address?.postal_code?.trim() ?? null;
}
