/** Stripe Accounts v2 object (subset used by this sample). Full shape: https://docs.stripe.com/api/v2/core/accounts/object */
export interface ConnectSampleV2Account {
  id: string;
  display_name?: string | { default?: string };
  contact_email?: string;
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
    customer?: Record<string, unknown>;
  };
}

export interface ConnectSampleAccountStatus {
  accountId: string;
  readyToProcessPayments: boolean;
  onboardingComplete: boolean;
  requirementsStatus: string | null;
  cardPaymentsStatus: string | null;
}

export interface ConnectSampleProductSummary {
  id: string;
  name: string;
  description: string | null;
  priceId: string | null;
  unitAmount: number | null;
  currency: string | null;
}

export interface ConnectSampleAccountRecord {
  demo_user_email: string;
  stripe_account_id: string;
  display_name: string;
  subscription_status: string | null;
  subscription_price_id: string | null;
  subscription_current_period_end: string | null;
  updated_at: string;
}

/**
 * Stripe SDK fields added for Accounts v2 (customer_account on billing objects).
 * Cast to these when stripe@17 types are installed; stripe@latest includes them natively.
 */
export type ConnectSampleSubscription = {
  id: string;
  status: string;
  customer_account?: string | null;
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  pause_collection?: { behavior?: string; resumes_at?: number } | null;
  items: {
    data: Array<{
      quantity?: number;
      price?: { id?: string } | null;
    }>;
  };
  default_payment_method?: string | null;
};

export type ConnectSampleInvoice = {
  id: string;
  customer_account?: string | null;
  lines: { data: Array<{ price?: { id?: string } | null }> };
};

export type ConnectSampleCustomer = {
  id: string;
  customer_account?: string | null;
  invoice_settings?: { default_payment_method?: string | null };
};
