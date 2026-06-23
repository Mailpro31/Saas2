import "server-only";
import Stripe from "stripe";
import { serverEnv } from "@/lib/env";

let stripe: Stripe | null = null;

/**
 * Lazily-instantiated Stripe client (server-only). Lazy init avoids
 * crashing `next build` when the secret key is absent at build time.
 * Uses the SDK's pinned default API version.
 */
export function getStripe(): Stripe {
  if (!stripe) {
    stripe = new Stripe(serverEnv().STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return stripe;
}
