import type Stripe from "stripe";
import { updateConnectSampleSubscription } from "@/lib/stripe/connectSample/database";
import type {
  ConnectSampleCustomer,
  ConnectSampleInvoice,
  ConnectSampleSubscription,
} from "@/lib/stripe/connectSample/types";

/**
 * Standard (non-thin) subscription webhooks for the platform billing flow.
 * Store subscription status in connect_sample_accounts when Supabase is configured.
 */
export async function handleConnectSampleSubscriptionEvent(
  event: Stripe.Event
): Promise<void> {
  switch (event.type) {
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(
        event.data.object as ConnectSampleSubscription
      );
      return;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(
        event.data.object as ConnectSampleSubscription
      );
      return;

    case "invoice.paid":
      await handleInvoicePaid(event.data.object as ConnectSampleInvoice);
      return;

    case "payment_method.attached":
      console.info(
        "[connect-sample/subscription] payment_method.attached",
        (event.data.object as Stripe.PaymentMethod).id
      );
      // TODO: store default payment method metadata if needed for your product access rules.
      return;

    case "payment_method.detached":
      console.info(
        "[connect-sample/subscription] payment_method.detached",
        (event.data.object as Stripe.PaymentMethod).id
      );
      // TODO: update billing UI cache when a payment method is removed.
      return;

    case "customer.updated": {
      const customer = event.data.object as ConnectSampleCustomer;
      const accountId = customer.customer_account ?? null;
      const defaultPm = customer.invoice_settings?.default_payment_method ?? null;
      console.info("[connect-sample/subscription] customer.updated", {
        accountId,
        defaultPaymentMethod: defaultPm,
      });
      // TODO: persist invoice_settings.default_payment_method in connect_sample_accounts.
      return;
    }

    case "customer.tax_id.created":
    case "customer.tax_id.updated":
    case "customer.tax_id.deleted":
      console.info("[connect-sample/subscription]", event.type);
      // TODO: sync tax ID validation status for billing compliance.
      return;

    case "billing_portal.configuration.created":
    case "billing_portal.configuration.updated":
    case "billing_portal.session.created":
      console.info("[connect-sample/subscription]", event.type);
      return;

    default:
      console.info("[connect-sample/subscription] Ignored event", event.type);
  }
}

/** Upgrades, downgrades, quantity changes, cancel-at-period-end, pause/resume */
async function handleSubscriptionUpdated(
  subscription: ConnectSampleSubscription
): Promise<void> {
  const accountId = subscription.customer_account ?? null;

  if (!accountId) {
    console.warn(
      "[connect-sample/subscription] Missing customer_account on subscription",
      subscription.id
    );
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id ?? null;
  const quantity = subscription.items.data[0]?.quantity ?? 1;
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  if (subscription.cancel_at_period_end) {
    console.info(
      "[connect-sample/subscription] Subscription scheduled to cancel at period end",
      { accountId, subscriptionId: subscription.id }
    );
  }

  if (subscription.pause_collection) {
    console.info("[connect-sample/subscription] Subscription collection paused", {
      accountId,
      behavior: subscription.pause_collection.behavior,
      resumesAt: subscription.pause_collection.resumes_at,
    });
  }

  console.info("[connect-sample/subscription] subscription.updated", {
    accountId,
    status: subscription.status,
    priceId,
    quantity,
  });

  await updateConnectSampleSubscription({
    stripeAccountId: accountId,
    status: subscription.status,
    priceId,
    currentPeriodEnd,
  });
}

async function handleSubscriptionDeleted(
  subscription: ConnectSampleSubscription
): Promise<void> {
  const accountId = subscription.customer_account ?? null;

  if (!accountId) {
    console.warn(
      "[connect-sample/subscription] Missing customer_account on deleted subscription",
      subscription.id
    );
    return;
  }

  await updateConnectSampleSubscription({
    stripeAccountId: accountId,
    status: "canceled",
    priceId: subscription.items.data[0]?.price?.id ?? null,
    currentPeriodEnd: null,
  });
}

async function handleInvoicePaid(invoice: ConnectSampleInvoice): Promise<void> {
  const accountId = invoice.customer_account ?? null;
  if (!accountId) return;

  await updateConnectSampleSubscription({
    stripeAccountId: accountId,
    status: "active",
    priceId: invoice.lines.data[0]?.price?.id ?? null,
  });
}
