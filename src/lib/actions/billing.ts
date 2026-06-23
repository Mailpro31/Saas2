"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import { getStripe } from "@/lib/stripe/server";
import { serverEnv } from "@/lib/env";
import { ok, fail, type ActionResult } from "./result";

export async function createCheckoutSession(
  interval: "monthly" | "yearly" = "monthly",
): Promise<ActionResult<{ url: string }>> {
  const session = await getSession();
  if (!session) return fail("Vous devez être connecté.");
  if (session.profile.plan === "pro") {
    return fail("Vous êtes déjà abonné au plan Pro.");
  }

  const env = serverEnv();
  const stripe = getStripe();

  const price =
    interval === "yearly" && env.STRIPE_PRICE_PRO_YEARLY
      ? env.STRIPE_PRICE_PRO_YEARLY
      : env.STRIPE_PRICE_PRO_MONTHLY;

  try {
    // Reuse or create the Stripe customer for this profile.
    let customerId = session.profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email ?? undefined,
        metadata: { supabase_user_id: session.user.id },
      });
      customerId = customer.id;
      const admin = createAdminClient();
      const { error: updateError } = await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", session.user.id);
      if (updateError) {
        console.error("[stripe] failed to persist customer id:", updateError);
        // Non-fatal: the webhook also persists the customer id via metadata.
      }
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: session.user.id,
      subscription_data: {
        metadata: { supabase_user_id: session.user.id },
      },
      success_url: `${env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?success=1`,
      cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?canceled=1`,
    });
    if (!checkout.url) return fail("Impossible de démarrer le paiement.");
    return ok({ url: checkout.url });
  } catch (error) {
    console.error("[stripe] checkout error:", error);
    return fail("Le service de paiement est indisponible. Réessayez.");
  }
}

export async function createPortalSession(): Promise<
  ActionResult<{ url: string }>
> {
  const session = await getSession();
  if (!session) return fail("Vous devez être connecté.");

  const customerId = session.profile.stripe_customer_id;
  if (!customerId) {
    return fail("Aucun abonnement à gérer pour le moment.");
  }

  const env = serverEnv();
  const stripe = getStripe();

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`,
    });
    return ok({ url: portal.url });
  } catch (error) {
    console.error("[stripe] portal error:", error);
    return fail("Impossible d'ouvrir la gestion de l'abonnement.");
  }
}
