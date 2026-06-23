import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Supabase admin client using the service-role key. BYPASSES Row Level
 * Security. Use ONLY in trusted server code (server actions / route
 * handlers / server components) for operations that cannot be expressed
 * with user-scoped RLS:
 *  - reading public storefront data (collection page, wall, embed) so that
 *    anon never has direct table access
 *  - public testimonial submission (insert as 'pending' after validation)
 *  - media uploads from the public collection form
 *  - Stripe webhook syncing the profiles table
 *
 * Reads its own env vars directly (decoupled from Stripe/Resend config) so it
 * works on public pages that don't need those. Never expose this client or the
 * service-role key to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Configuration Supabase admin manquante (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
  }
  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
