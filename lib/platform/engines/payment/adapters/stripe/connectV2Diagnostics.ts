import {
  WINNER_CONNECT_V2_DASHBOARD,
  WINNER_CONNECT_V2_RESPONSIBILITIES,
  ensureWinnerConnectV2AccountReady,
  readWinnerV2ConnectFlags,
  retrieveWinnerConnectV2AccountDetailed,
} from "@/lib/platform/engines/payment/adapters/stripe/connectV2Payouts";
import type { PlayerConnectIdentityPrefill } from "@/lib/database/services/stripeConnect";
import type { PlayerConnectStatus } from "@/lib/platform/engines/payment/adapters/stripe/connectTypes";

export type ConnectV2DiagnosticIssue = {
  field: string;
  expected: string;
  actual: string | null;
  severity: "error" | "warning";
  message: string;
};

export type ConnectV2DiagnosticReport = {
  accountId: string;
  playerEmail: string | null;
  dbStatus: PlayerConnectStatus | null;
  stripe: {
    contactEmail: string | null;
    dashboard: string | null;
    feesCollector: string | null;
    lossesCollector: string | null;
    transfersStatus: string | null;
    cardPaymentsStatus: string | null;
    requirementsStatus: string | null;
    detailsSubmitted: boolean;
    payoutsEnabled: boolean;
  };
  expected: {
    dashboard: typeof WINNER_CONNECT_V2_DASHBOARD;
    feesCollector: "application";
    lossesCollector: "application";
  };
  issues: ConnectV2DiagnosticIssue[];
  healthy: boolean;
  canRepair: boolean;
  repairFixesConfig: boolean;
};

function issue(
  field: string,
  expected: string,
  actual: string | null,
  message: string,
  severity: ConnectV2DiagnosticIssue["severity"] = "error"
): ConnectV2DiagnosticIssue {
  return { field, expected, actual, message, severity };
}

export async function diagnoseWinnerConnectV2Account(input: {
  accountId: string;
  playerEmail?: string | null;
  dbStatus?: PlayerConnectStatus | null;
}): Promise<ConnectV2DiagnosticReport> {
  const account = await retrieveWinnerConnectV2AccountDetailed(input.accountId);
  const flags = readWinnerV2ConnectFlags(account);

  const dashboard = account.dashboard ?? null;
  const feesCollector = account.defaults?.responsibilities?.fees_collector ?? null;
  const lossesCollector = account.defaults?.responsibilities?.losses_collector ?? null;
  const transfersStatus =
    account.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers
      ?.status ?? null;
  const cardPaymentsStatus =
    account.configuration?.merchant?.capabilities?.card_payments?.status ?? null;
  const requirementsStatus =
    account.requirements?.summary?.minimum_deadline?.status ?? null;

  const issues: ConnectV2DiagnosticIssue[] = [];

  if (dashboard !== WINNER_CONNECT_V2_DASHBOARD) {
    issues.push(
      issue(
        "dashboard",
        WINNER_CONNECT_V2_DASHBOARD,
        dashboard,
        "Dashboard must be set for recipient stripe_transfers accounts."
      )
    );
  }

  if (feesCollector !== WINNER_CONNECT_V2_RESPONSIBILITIES.fees_collector) {
    issues.push(
      issue(
        "defaults.responsibilities.fees_collector",
        WINNER_CONNECT_V2_RESPONSIBILITIES.fees_collector,
        feesCollector,
        "Platform must collect Stripe fees for this account configuration."
      )
    );
  }

  if (lossesCollector !== WINNER_CONNECT_V2_RESPONSIBILITIES.losses_collector) {
    issues.push(
      issue(
        "defaults.responsibilities.losses_collector",
        WINNER_CONNECT_V2_RESPONSIBILITIES.losses_collector,
        lossesCollector,
        "Platform must be the losses collector for this account configuration."
      )
    );
  }

  if (!cardPaymentsStatus) {
    issues.push(
      issue(
        "configuration.merchant.capabilities.card_payments",
        "requested or active",
        cardPaymentsStatus,
        "Merchant card_payments capability is missing — required before stripe_transfers."
      )
    );
  }

  if (!transfersStatus) {
    issues.push(
      issue(
        "configuration.recipient.capabilities.stripe_balance.stripe_transfers",
        "requested or active",
        transfersStatus,
        "Recipient transfers capability is missing.",
        "warning"
      )
    );
  } else if (transfersStatus !== "active") {
    issues.push(
      issue(
        "configuration.recipient.capabilities.stripe_balance.stripe_transfers.status",
        "active",
        transfersStatus,
        "Player still needs to finish payout provider onboarding.",
        "warning"
      )
    );
  }

  if (requirementsStatus === "currently_due" || requirementsStatus === "past_due") {
    issues.push(
      issue(
        "requirements.summary.minimum_deadline.status",
        "complete",
        requirementsStatus,
        "Payout provider still needs identity or bank details from the player.",
        "warning"
      )
    );
  }

  const repairFixesConfig = issues.some((entry) => entry.severity === "error");

  return {
    accountId: input.accountId,
    playerEmail: input.playerEmail ?? account.contact_email ?? null,
    dbStatus: input.dbStatus ?? null,
    stripe: {
      contactEmail: account.contact_email ?? null,
      dashboard,
      feesCollector,
      lossesCollector,
      transfersStatus,
      cardPaymentsStatus,
      requirementsStatus,
      detailsSubmitted: flags.detailsSubmitted,
      payoutsEnabled: flags.payoutsEnabled,
    },
    expected: {
      dashboard: WINNER_CONNECT_V2_DASHBOARD,
      feesCollector: WINNER_CONNECT_V2_RESPONSIBILITIES.fees_collector,
      lossesCollector: WINNER_CONNECT_V2_RESPONSIBILITIES.losses_collector,
    },
    issues,
    healthy: issues.length === 0,
    canRepair: repairFixesConfig,
    repairFixesConfig,
  };
}

export async function repairWinnerConnectV2Account(
  accountId: string,
  prefill?: PlayerConnectIdentityPrefill
): Promise<ConnectV2DiagnosticReport> {
  await ensureWinnerConnectV2AccountReady(accountId, prefill);
  return diagnoseWinnerConnectV2Account({ accountId });
}
