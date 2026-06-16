import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  getSquareWallet,
  formatSquareWalletPaymentLabel,
} from "@/lib/platform/engines/payment";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ savedPayment: null, fastCheckoutAvailable: false });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wallet = await getSquareWallet(user.email);

  return NextResponse.json({
    savedPayment: wallet.fastCheckoutAvailable
      ? {
          brand: wallet.paymentMethodBrand,
          last4: wallet.paymentMethodLast4,
          label: formatSquareWalletPaymentLabel(wallet),
        }
      : null,
    fastCheckoutAvailable: wallet.fastCheckoutAvailable,
    accountSuspended: wallet.accountSuspended,
  });
}
