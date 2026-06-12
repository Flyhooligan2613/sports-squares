import { getStripeClient } from "@/lib/stripe/connectSample/client";
import type { ConnectSampleV2Account } from "@/lib/stripe/connectSample/types";

type StripeV2Core = {
  accounts: {
    create: (params: Record<string, unknown>) => Promise<ConnectSampleV2Account>;
    retrieve: (
      id: string,
      params?: { include?: string[] }
    ) => Promise<ConnectSampleV2Account>;
  };
  accountLinks: {
    create: (params: Record<string, unknown>) => Promise<{ url: string }>;
  };
  events: {
    retrieve: (id: string) => Promise<{ id: string; type: string; data?: unknown }>;
  };
};

function v2Core(): StripeV2Core {
  const stripeClient = getStripeClient();
  const core = (stripeClient as unknown as { v2?: { core?: StripeV2Core } }).v2
    ?.core;

  if (!core?.accounts?.create) {
    throw new Error(
      "Stripe Accounts v2 requires stripe@latest (v22+). Run: npm install stripe@latest"
    );
  }

  return core;
}

/**
 * Step 1 — Create a connected account using the Accounts v2 API.
 * Never pass top-level `type: 'express' | 'standard' | 'custom'`.
 */
export async function createConnectSampleV2Account(input: {
  displayName: string;
  contactEmail: string;
}): Promise<ConnectSampleV2Account> {
  return v2Core().accounts.create({
    display_name: input.displayName,
    contact_email: input.contactEmail,
    identity: {
      country: "us",
    },
    dashboard: "full",
    defaults: {
      responsibilities: {
        fees_collector: "stripe",
        losses_collector: "stripe",
      },
    },
    configuration: {
      customer: {},
      merchant: {
        capabilities: {
          card_payments: {
            requested: true,
          },
        },
      },
    },
  });
}

/**
 * Step 2 — Always retrieve account status directly from Stripe (not DB).
 */
export async function retrieveConnectSampleV2Account(
  accountId: string
): Promise<ConnectSampleV2Account> {
  return v2Core().accounts.retrieve(accountId, {
    include: ["configuration.merchant", "requirements"],
  });
}

/**
 * Step 3 — Create an Account Link for hosted onboarding.
 */
export async function createConnectSampleAccountLink(input: {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}): Promise<string> {
  const accountLink = await v2Core().accountLinks.create({
    account: input.accountId,
    use_case: {
      type: "account_onboarding",
      account_onboarding: {
        configurations: ["merchant", "customer"],
        refresh_url: input.refreshUrl,
        return_url: input.returnUrl,
      },
    },
  });

  if (!accountLink.url) {
    throw new Error("Stripe did not return an account link URL.");
  }

  return accountLink.url;
}

/** Fetch full thin event payload after parseThinEvent */
export async function retrieveConnectSampleV2Event(eventId: string) {
  return v2Core().events.retrieve(eventId);
}

/** Parse thin webhook payload — requires stripe@latest */
export function parseConnectSampleThinEvent(
  rawBody: string,
  signature: string,
  webhookSecret: string
): { id: string; type?: string } {
  const stripeClient = getStripeClient();
  const parser = stripeClient as unknown as {
    parseThinEvent?: (
      body: string,
      sig: string,
      secret: string
    ) => { id: string; type?: string };
  };

  if (!parser.parseThinEvent) {
    throw new Error(
      "parseThinEvent requires stripe@latest. Upgrade the SDK and configure a thin webhook destination."
    );
  }

  return parser.parseThinEvent(rawBody, signature, webhookSecret);
}
