import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { EcosystemAdminConfig } from "@/lib/platform/ecosystem/config";

export async function getAdminConfig<K extends keyof EcosystemAdminConfig>(
  key: K
): Promise<EcosystemAdminConfig[K]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ecosystem_admin_config")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) throw error;
  return (data?.value ?? {}) as EcosystemAdminConfig[K];
}

export async function setAdminConfig<K extends keyof EcosystemAdminConfig>(
  key: K,
  value: EcosystemAdminConfig[K]
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("ecosystem_admin_config").upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
