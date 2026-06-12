import type {
  ConnectSampleAccountStatus,
  ConnectSampleV2Account,
} from "@/lib/stripe/connectSample/types";

/**
 * Derive onboarding + payments readiness from a live V2 Account object.
 * Always fetch from the API — do not cache onboarding state for this demo.
 */
export function parseConnectSampleAccountStatus(
  account: ConnectSampleV2Account
): ConnectSampleAccountStatus {
  const cardPaymentsStatus =
    account.configuration?.merchant?.capabilities?.card_payments?.status ??
    null;

  const readyToProcessPayments = cardPaymentsStatus === "active";

  const requirementsStatus =
    account.requirements?.summary?.minimum_deadline?.status ?? null;

  const onboardingComplete =
    requirementsStatus !== "currently_due" &&
    requirementsStatus !== "past_due";

  return {
    accountId: account.id,
    readyToProcessPayments,
    onboardingComplete,
    requirementsStatus,
    cardPaymentsStatus,
  };
}

export function displayNameFromV2Account(account: ConnectSampleV2Account): string {
  if (typeof account.display_name === "string") return account.display_name;
  return account.display_name?.default ?? account.contact_email ?? account.id;
}
