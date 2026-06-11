import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/supabase";

export function getDatabaseClient() {
  return createClient();
}

export function isDatabaseConfigured(): boolean {
  return getSupabaseConfig().isConfigured;
}
