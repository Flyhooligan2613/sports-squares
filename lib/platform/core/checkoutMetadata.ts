export const PURCHASE_TYPE_SQUARES = "squares";
export const PURCHASE_TYPE_PICKEM_ENTRY = "pickem_entry";
export const PURCHASE_TYPE_WALLET_DEPOSIT = "wallet_deposit";

export type PlatformPurchaseType =
  | typeof PURCHASE_TYPE_SQUARES
  | typeof PURCHASE_TYPE_PICKEM_ENTRY
  | typeof PURCHASE_TYPE_WALLET_DEPOSIT;

export function resolvePurchaseType(metadata: Record<string, string | undefined>): PlatformPurchaseType {
  if (metadata.purchaseType === PURCHASE_TYPE_PICKEM_ENTRY) {
    return PURCHASE_TYPE_PICKEM_ENTRY;
  }
  if (metadata.purchaseType === PURCHASE_TYPE_WALLET_DEPOSIT || metadata.walletDeposit === "true") {
    return PURCHASE_TYPE_WALLET_DEPOSIT;
  }
  return PURCHASE_TYPE_SQUARES;
}
