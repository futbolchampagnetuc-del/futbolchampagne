import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con service_role key.
 * ⚠️ SOLO usar en Edge Functions o scripts admin.
 * NUNCA en frontend.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
