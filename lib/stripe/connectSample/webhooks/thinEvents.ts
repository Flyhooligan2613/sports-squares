import {
  retrieveConnectSampleV2Account,
  retrieveConnectSampleV2Event,
} from "@/lib/stripe/connectSample/v2Accounts";

/**
 * Handle V2 thin account events.
 * Configure thin webhook destination in Stripe Dashboard for:
 * - v2.core.account[requirements].updated
 * - v2.core.account[configuration.merchant].capability_status_updated
 * - v2.core.account[configuration.customer].capability_status_updated
 */
export async function handleConnectSampleThinEvent(event: {
  id: string;
  type: string;
  data?: unknown;
}): Promise<void> {
  console.info("[connect-sample/thin]", event.type, event.id);

  switch (event.type) {
    case "v2.core.account.requirements.updated":
    case "v2.core.account.configuration.merchant.capability_status_updated":
    case "v2.core.account.configuration.customer.capability_status_updated":
    case "v2.core.account.updated": {
      const accountId = extractAccountIdFromThinEvent(event);
      if (!accountId) {
        console.warn("[connect-sample/thin] No account id on event", event.type);
        return;
      }

      // Re-fetch account from API when requirements change (do not trust webhook cache).
      const account = await retrieveConnectSampleV2Account(accountId);
      console.info("[connect-sample/thin] Account refreshed", {
        accountId: account.id,
        requirements:
          account.requirements?.summary?.minimum_deadline?.status ?? null,
        cardPayments:
          account.configuration?.merchant?.capabilities?.card_payments
            ?.status ?? null,
      });

      // TODO: notify merchant in-app or email when requirements become past_due.
      return;
    }
    default:
      console.info("[connect-sample/thin] Unhandled event type", event.type);
  }
}

export async function loadThinEventFromNotification(thinEventId: string) {
  return retrieveConnectSampleV2Event(thinEventId);
}

function extractAccountIdFromThinEvent(event: {
  type: string;
  data?: unknown;
}): string | null {
  const data = event.data as Record<string, unknown> | undefined;
  if (!data) return null;

  if (typeof data.account === "string") return data.account;
  if (typeof data.id === "string" && data.id.startsWith("acct_")) return data.id;

  const object = data.object as Record<string, unknown> | undefined;
  if (typeof object?.id === "string" && object.id.startsWith("acct_")) {
    return object.id;
  }

  return null;
}
