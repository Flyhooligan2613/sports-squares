import { getStripe } from "@/lib/stripe/client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import type Stripe from "stripe";

export interface PlayerWalletSummary {
  stripeCustomerId: string | null;
  defaultPaymentMethodId: string | null;
  brand: string | null;
  last4: string | null;
  fastCheckoutAvailable: boolean;
  accountSuspended: boolean;
}

function mapWallet(row: Record<string, unknown> | null): PlayerWalletSummary {
  const brand = (row?.payment_method_brand as string | null) ?? null;
  const last4 = (row?.payment_method_last4 as string | null) ?? null;
  const defaultPaymentMethodId = (row?.default_payment_method_id as string | null) ?? null;
  const suspended = Boolean(row?.account_suspended);

  return {
    stripeCustomerId: (row?.stripe_customer_id as string | null) ?? null,
    defaultPaymentMethodId,
    brand,
    last4,
    fastCheckoutAvailable: Boolean(defaultPaymentMethodId && last4 && !suspended),
    accountSuspended: suspended,
  };
}

export async function getPlayerWallet(email: string): Promise<PlayerWalletSummary> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);
  const { data, error } = await supabase
    .from("player_auth_profiles")
    .select(
      "stripe_customer_id, default_payment_method_id, payment_method_brand, payment_method_last4, account_suspended"
    )
    .eq("email", normalized)
    .maybeSingle();

  if (error) throw error;
  return mapWallet(data as Record<string, unknown> | null);
}

export async function getOrCreateStripeCustomer(email: string): Promise<string> {
  const wallet = await getPlayerWallet(email);
  if (wallet.stripeCustomerId) return wallet.stripeCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: normalizeEmail(email),
    metadata: { platform: "squareboards" },
  });

  const supabase = getSupabaseAdmin();
  await supabase.from("player_auth_profiles").upsert(
    {
      email: normalizeEmail(email),
      stripe_customer_id: customer.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );

  return customer.id;
}

async function resolvePaymentMethodDetails(
  paymentMethodId: string
): Promise<{ brand: string | null; last4: string | null }> {
  const stripe = getStripe();
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  if (pm.type !== "card" || !pm.card) {
    return { brand: pm.type, last4: null };
  }
  return { brand: pm.card.brand ?? "card", last4: pm.card.last4 ?? null };
}

export async function savePlayerPaymentMethod(input: {
  email: string;
  stripeCustomerId: string;
  paymentMethodId: string;
}): Promise<void> {
  const { brand, last4 } = await resolvePaymentMethodDetails(input.paymentMethodId);
  const supabase = getSupabaseAdmin();

  await supabase.from("player_auth_profiles").upsert(
    {
      email: normalizeEmail(input.email),
      stripe_customer_id: input.stripeCustomerId,
      default_payment_method_id: input.paymentMethodId,
      payment_method_brand: brand,
      payment_method_last4: last4,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );
}

export async function syncPlayerWalletFromCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<void> {
  const email = session.metadata?.email ?? session.customer_email;
  if (!email) return;

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;

  if (!customerId) return;

  const stripe = getStripe();
  const customer = await stripe.customers.retrieve(customerId, {
    expand: ["invoice_settings.default_payment_method"],
  });

  if (customer.deleted) return;

  let paymentMethodId: string | null = null;
  const defaultPm = customer.invoice_settings?.default_payment_method;
  if (typeof defaultPm === "string") {
    paymentMethodId = defaultPm;
  } else if (defaultPm && typeof defaultPm === "object" && "id" in defaultPm) {
    paymentMethodId = defaultPm.id;
  }

  if (!paymentMethodId && session.payment_intent) {
    const piId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent.id;
    const pi = await stripe.paymentIntents.retrieve(piId, {
      expand: ["payment_method"],
    });
    const pm = pi.payment_method;
    if (typeof pm === "string") paymentMethodId = pm;
    else if (pm && typeof pm === "object" && "id" in pm) paymentMethodId = pm.id;
  }

  if (!paymentMethodId) {
    const methods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
      limit: 1,
    });
    paymentMethodId = methods.data[0]?.id ?? null;
  }

  if (!paymentMethodId) {
    const supabase = getSupabaseAdmin();
    await supabase.from("player_auth_profiles").upsert(
      {
        email: normalizeEmail(email),
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );
    return;
  }

  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  await savePlayerPaymentMethod({
    email,
    stripeCustomerId: customerId,
    paymentMethodId,
  });
}

export async function chargeSavedPaymentMethod(input: {
  email: string;
  amountCents: number;
  description: string;
  metadata: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  const wallet = await getPlayerWallet(input.email);
  if (wallet.accountSuspended) {
    throw new Error("This account is temporarily suspended.");
  }
  if (!wallet.stripeCustomerId || !wallet.defaultPaymentMethodId) {
    throw new Error("No saved payment method on file.");
  }

  const stripe = getStripe();
  return stripe.paymentIntents.create({
    amount: input.amountCents,
    currency: "usd",
    customer: wallet.stripeCustomerId,
    payment_method: wallet.defaultPaymentMethodId,
    off_session: true,
    confirm: true,
    description: input.description,
    metadata: input.metadata,
  });
}

export function formatSavedPaymentLabel(wallet: PlayerWalletSummary): string | null {
  if (!wallet.last4) return null;
  const brand = wallet.brand ? wallet.brand.charAt(0).toUpperCase() + wallet.brand.slice(1) : "Card";
  return `${brand} ···· ${wallet.last4}`;
}
