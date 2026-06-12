import type Stripe from "stripe";
import { getAppUrl } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/client";

export function isStripeConnectEnabled(): boolean {
  return process.env.STRIPE_CONNECT_ENABLED === "true";
}

export async function createExpressConnectAccount(
  email: string
): Promise<Stripe.Account> {
  const stripe = getStripe();
  return stripe.accounts.create({
    type: "express",
    email,
    capabilities: {
      transfers: { requested: true },
    },
    business_type: "individual",
    metadata: {
      email: email.trim().toLowerCase(),
      platform: "squareboards",
    },
  });
}

export async function createConnectAccountLink(
  accountId: string,
  type: "account_onboarding" | "account_update" = "account_onboarding"
): Promise<Stripe.AccountLink> {
  const stripe = getStripe();
  const appUrl = getAppUrl();

  return stripe.accountLinks.create({
    account: accountId,
    type,
    refresh_url: `${appUrl}/my-games/winnings?connect=refresh`,
    return_url: `${appUrl}/my-games/winnings?connect=complete`,
  });
}

export async function retrieveConnectAccount(
  accountId: string
): Promise<Stripe.Account> {
  const stripe = getStripe();
  return stripe.accounts.retrieve(accountId);
}

export async function createConnectTransfer(input: {
  amountCents: number;
  destinationAccountId: string;
  idempotencyKey: string;
  metadata: Record<string, string>;
}): Promise<Stripe.Transfer> {
  const stripe = getStripe();

  return stripe.transfers.create(
    {
      amount: input.amountCents,
      currency: "usd",
      destination: input.destinationAccountId,
      metadata: input.metadata,
    },
    { idempotencyKey: input.idempotencyKey }
  );
}

export function readConnectFlags(account: Stripe.Account): {
  detailsSubmitted: boolean;
  payoutsEnabled: boolean;
} {
  return {
    detailsSubmitted: account.details_submitted ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
  };
}
