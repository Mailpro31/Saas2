import "server-only";
import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * Supabase admin client using the service-role key. BYPASSES Row Level
 * Security. Use ONLY in trusted server code (server actions / route
 * handlers) for operations that cannot be expressed with user-scoped RLS:
 *  - public testimonial submission (insert as 'pending' after validation)
 *  - media uploads from the public collection form
 *  - Stripe webhook syncing the profiles table
 *
 * Never expose this client or the service-role key to the browser.
 */
export function createAdminClient() {
  const env = serverEnv();
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
