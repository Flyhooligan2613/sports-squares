import type Stripe from "stripe";
import { getAppUrl } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/client";
import type { PlayerConnectIdentityPrefill } from "@/lib/database/services/stripeConnect";

/** Dashboard access for winner recipients — platform owns payout UX in My Winnings. */
export const WINNER_CONNECT_V2_DASHBOARD = "none" as const;

/** Marketplace-style recipient accounts: platform collects fees and covers losses. */
export const WINNER_CONNECT_V2_RESPONSIBILITIES = {
  fees_collector: "application",
  losses_collector: "application",
} as const;

/**
 * Stripe requires merchant.card_payments to be requested before recipient stripe_transfers
 * on many platform configurations (including SquareBoards live).
 */
export const WINNER_CONNECT_V2_CONFIGURATION = {
  merchant: {
    capabilities: {
      card_payments: {
        requested: true,
      },
    },
  },
  recipient: {
    capabilities: {
      stripe_balance: {
        stripe_transfers: {
          requested: true,
        },
      },
    },
  },
} as const;

/** Winner payout account (Accounts v2 subset used for recipient transfers). */
export type WinnerConnectV2Account = {
  id: string;
  contact_email?: string;
  display_name?: string | { default?: string };
  dashboard?: string | null;
  defaults?: {
    responsibilities?: {
      fees_collector?: string | null;
      losses_collector?: string | null;
    };
  };
  requirements?: {
    summary?: {
      minimum_deadline?: {
        status?: string;
      };
    };
  };
  configuration?: {
    merchant?: {
      capabilities?: {
        card_payments?: {
          status?: string;
        };
      };
    };
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

function buildWinnerConnectIdentityPayload(
  prefill: PlayerConnectIdentityPrefill
): Record<string, unknown> {
  const identity: Record<string, unknown> = {
    country: "us",
    entity_type: "individual",
  };

  const individual: Record<string, unknown> = {};

  if (prefill.firstName) individual.given_name = prefill.firstName;
  if (prefill.lastName) individual.surname = prefill.lastName;

  if (prefill.addressLine1) {
    individual.address = {
      country: "US",
      line1: prefill.addressLine1,
      ...(prefill.addressLine2 ? { line2: prefill.addressLine2 } : {}),
      ...(prefill.city ? { city: prefill.city } : {}),
      ...(prefill.state ? { state: prefill.state } : {}),
      ...(prefill.postalCode ? { postal_code: prefill.postalCode } : {}),
    };
  }

  if (Object.keys(individual).length > 0) {
    identity.individual = individual;
  }

  return identity;
}

/**
 * Create a V2 connected account configured to receive platform transfers (winner payouts).
 * Requests merchant.card_payments (required by Stripe) plus recipient stripe_transfers.
 */
export async function createWinnerConnectV2Account(input: {
  email: string;
  displayName: string;
  prefill?: PlayerConnectIdentityPrefill;
}): Promise<WinnerConnectV2Account> {
  const prefill = input.prefill ?? {
    email: input.email,
    displayName: input.displayName,
  };

  const account = await v2Core().accounts.create({
    display_name: prefill.displayName || input.displayName,
    contact_email: input.email,
    dashboard: WINNER_CONNECT_V2_DASHBOARD,
    identity: buildWinnerConnectIdentityPayload(prefill),
    defaults: {
      responsibilities: WINNER_CONNECT_V2_RESPONSIBILITIES,
    },
    configuration: WINNER_CONNECT_V2_CONFIGURATION,
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
  return retrieveWinnerConnectV2AccountDetailed(accountId);
}

export async function retrieveWinnerConnectV2AccountDetailed(
  accountId: string
): Promise<WinnerConnectV2Account> {
  const account = await v2Core().accounts.retrieve(
    accountId,
    {
      include: ["defaults", "identity", "configuration.merchant", "configuration.recipient", "requirements"],
    },
    accountContext(accountId)
  );

  return account as unknown as WinnerConnectV2Account;
}

/** Stripe requires dashboard + application collectors for recipient stripe_transfers. */
export async function ensureWinnerConnectV2AccountReady(
  accountId: string,
  prefill?: PlayerConnectIdentityPrefill
): Promise<void> {
  const patch: Record<string, unknown> = {
    dashboard: WINNER_CONNECT_V2_DASHBOARD,
    defaults: {
      responsibilities: WINNER_CONNECT_V2_RESPONSIBILITIES,
    },
    configuration: WINNER_CONNECT_V2_CONFIGURATION,
  };

  if (prefill) {
    patch.display_name = prefill.displayName;
    patch.contact_email = prefill.email;
    patch.identity = buildWinnerConnectIdentityPayload(prefill);
  }

  await v2Core().accounts.update(accountId, patch, accountContext(accountId));
}

export async function createWinnerConnectV2AccountLink(input: {
  accountId: string;
  returnUrl?: string;
  refreshUrl?: string;
  prefill?: PlayerConnectIdentityPrefill;
}): Promise<string> {
  const appUrl = getAppUrl();
  const refreshUrl =
    input.refreshUrl ?? `${appUrl}/my-games/winnings?connect=refresh`;
  const returnUrl =
    input.returnUrl ?? `${appUrl}/my-games/winnings?connect=complete`;

  await ensureWinnerConnectV2AccountReady(input.accountId, input.prefill);

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
