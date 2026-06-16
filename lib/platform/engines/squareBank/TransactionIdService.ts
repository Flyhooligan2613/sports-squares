import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** Generate unique SQ-YYYY-00000012345 transaction IDs. */
export async function generateSquareBankTransactionId(): Promise<string> {
  const year = new Date().getFullYear();
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("square_bank_transaction_seq")
    .select("last_value")
    .eq("year", year)
    .maybeSingle();

  let nextValue: number;
  if (existing) {
    nextValue = Number(existing.last_value) + 1;
    await supabase
      .from("square_bank_transaction_seq")
      .update({ last_value: nextValue })
      .eq("year", year);
  } else {
    nextValue = 1;
    await supabase.from("square_bank_transaction_seq").insert({ year, last_value: nextValue });
  }

  return `SQ-${year}-${String(nextValue).padStart(11, "0")}`;
}
