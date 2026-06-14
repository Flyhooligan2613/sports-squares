import type Stripe from "stripe";
import { getAppUrl } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/client";

/** Dashboard access for winner recipients — platform owns payout UX in My Winnings. */
export const WINNER_CONNECT_V2_DASHBOARD = "none" as const;

/** Winner payout account (Accounts v2 subset used for recipient transfers). */
export type WinnerConnectV2Account = {
  id: string;
  contact_email?: string;
  display_name?: string | { default?: string };
  requirements?: {
    summary?: {
      minimum_deadline?: {
        status?: string;
      };
    };
  };
  configuration?: {
    recipient?: {
      capabilities?: {
        stripe_balance?: {
          stripe_transfers?: {
            status?: string;
          };
        };
      };
    };
  };
};

function v2Core() {
  const stripe = getStripe();
  const core = stripe.v2?.core;
  if (!core?.accounts?.create) {
    throw new Error(
      "Stripe Accounts v2 requires stripe@latest. Run: npm install stripe@latest"
    );
  }
  return core;
}

function accountContext(accountId: string): Stripe.RequestOptions {
  return { stripeContext: accountId };
}

/**
 * Create a V2 connected account configured to receive platform transfers (winner payouts).
 * No top-level type field — uses recipient configuration, not merchant card_payments.
 */
export async function createWinnerConnectV2Account(input: {
  email: string;
  displayName: string;
}): Promise<WinnerConnectV2Account> {
  const account = await v2Core().accounts.create({
    display_name: input.displayName,
    contact_email: input.email,
    dashboard: WINNER_CONNECT_V2_DASHBOARD,
    identity: {
      country: "us",
    },
    defaults: {
      responsibilities: {
        fees_collector: "stripe",
        losses_collector: "stripe",
      },
    },
    configuration: {
      recipient: {
        capabilities: {
          stripe_balance: {
            stripe_transfers: {
              requested: true,
            },
          },
        },
      },
    },
    metadata: {
      email: input.email.trim().toLowerCase(),
      platform: "squareboards",
      role: "winner_payout",
    },
  });

  return account as unknown as WinnerConnectV2Account;
}

export async function retrieveWinnerConnectV2Account(
  accountId: string
): Promise<WinnerConnectV2Account> {
  const account = await v2Core().accounts.retrieve(
    accountId,
    { include: ["configuration.recipient", "requirements"] },
    accountContext(accountId)
  );

  return account as unknown as WinnerConnectV2Account;
}

/** Stripe requires dashboard when recipient stripe_transfers is requested. */
export async function ensureWinnerConnectV2Dashboard(accountId: string): Promise<void> {
  await v2Core().accounts.update(
    accountId,
    { dashboard: WINNER_CONNECT_V2_DASHBOARD },
    accountContext(accountId)
  );
}

export async function createWinnerConnectV2AccountLink(input: {
  accountId: string;
  returnUrl?: string;
  refreshUrl?: string;
}): Promise<string> {
  const appUrl = getAppUrl();
  const refreshUrl =
    input.refreshUrl ?? `${appUrl}/my-games/winnings?connect=refresh`;
  const returnUrl =
    input.returnUrl ?? `${appUrl}/my-games/winnings?connect=complete`;

  await ensureWinnerConnectV2Dashboard(input.accountId);

  const accountLink = await v2Core().accountLinks.create(
    {
      account: input.accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["recipient"],
          refresh_url: refreshUrl,
          return_url: returnUrl,
        },
      },
    },
    accountContext(input.accountId)
  );

  if (!accountLink.url) {
    throw new Error("Stripe did not return an account link URL.");
  }

  return accountLink.url;
}

/** Map V2 recipient account state → production PlayerConnectStatus fields. */
export function readWinnerV2ConnectFlags(account: WinnerConnectV2Account): {
  detailsSubmitted: boolean;
  payoutsEnabled: boolean;
} {
  const transfersStatus =
    account.configuration?.recipient?.capabilities?.stripe_balance
      ?.stripe_transfers?.status ?? null;

  const requirementsStatus =
    account.requirements?.summary?.minimum_deadline?.status ?? null;

  const onboardingComplete =
    requirementsStatus !== "currently_due" &&
    requirementsStatus !== "past_due";

  const payoutsEnabled =
    transfersStatus === "active" && onboardingComplete;

  return {
    detailsSubmitted: onboardingComplete,
    payoutsEnabled,
  };
}
