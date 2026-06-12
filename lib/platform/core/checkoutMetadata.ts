export const PURCHASE_TYPE_SQUARES = "squares";
export const PURCHASE_TYPE_PICKEM_ENTRY = "pickem_entry";

export type PlatformPurchaseType =
  | typeof PURCHASE_TYPE_SQUARES
  | typeof PURCHASE_TYPE_PICKEM_ENTRY;

export function resolvePurchaseType(metadata: Record<string, string | undefined>): PlatformPurchaseType {
  if (metadata.purchaseType === PURCHASE_TYPE_PICKEM_ENTRY) {
    return PURCHASE_TYPE_PICKEM_ENTRY;
  }
  return PURCHASE_TYPE_SQUARES;
}
