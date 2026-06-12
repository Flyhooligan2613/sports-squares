import { getStripeClient } from "@/lib/stripe/connectSample/client";
import type { ConnectSampleProductSummary } from "@/lib/stripe/connectSample/types";

/**
 * Create a product on the connected account using the Stripe-Account header.
 */
export async function createConnectSampleProduct(input: {
  connectedAccountId: string;
  name: string;
  description: string;
  priceInCents: number;
  currency?: string;
}): Promise<ConnectSampleProductSummary> {
  const stripeClient = getStripeClient();

  const product = await stripeClient.products.create(
    {
      name: input.name,
      description: input.description,
      default_price_data: {
        unit_amount: input.priceInCents,
        currency: input.currency ?? "usd",
      },
    },
    {
      stripeAccount: input.connectedAccountId,
    }
  );

  const defaultPrice =
    typeof product.default_price === "string"
      ? null
      : product.default_price;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    priceId:
      typeof product.default_price === "string"
        ? product.default_price
        : defaultPrice?.id ?? null,
    unitAmount: defaultPrice?.unit_amount ?? input.priceInCents,
    currency: defaultPrice?.currency ?? input.currency ?? "usd",
  };
}

/**
 * List active products for a connected account storefront.
 */
export async function listConnectSampleProducts(
  connectedAccountId: string
): Promise<ConnectSampleProductSummary[]> {
  const stripeClient = getStripeClient();

  const products = await stripeClient.products.list(
    {
      limit: 20,
      active: true,
      expand: ["data.default_price"],
    },
    {
      stripeAccount: connectedAccountId,
    }
  );

  return products.data.map((product) => {
    const defaultPrice =
      typeof product.default_price === "string"
        ? null
        : product.default_price;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceId:
        typeof product.default_price === "string"
          ? product.default_price
          : defaultPrice?.id ?? null,
      unitAmount: defaultPrice?.unit_amount ?? null,
      currency: defaultPrice?.currency ?? null,
    };
  });
}
