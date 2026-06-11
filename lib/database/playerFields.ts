/** Columns safe to expose on the public pool page (anon / unauthenticated). */
export const PUBLIC_PLAYER_SELECT =
  "id, pool_id, name, credits_allocated, credits_used, initials, color, amount_paid, payment_status, purchase_source, invite_delivery_status, sms_delivery_status";

export const ADMIN_PLAYER_SELECT = "*";
