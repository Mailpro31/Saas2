import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { serverEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** current_period_end moved to the subscription item in recent Stripe APIs. */
function getPeriodEnd(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0] as
    | (Stripe.SubscriptionItem & { current_period_end?: number })
    | undefined;
  const subWithPeriod = sub as Stripe.Subscription & {
    current_period_end?: number;
  };
  const ts = item?.current_period_end ?? subWithPeriod.current_period_end;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

function planFromStatus(status: Stripe.Subscription.Status): "free" | "pro" {
  return status === "active" || status === "trialing" ? "pro" : "free";
}

async function syncSubscription(sub: Stripe.Subscription) {
  const admin = createAdminClient();
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  await admin
    .from("profiles")
    .update({
      plan: planFromStatus(sub.status),
      stripe_subscription_id: sub.id,
      subscription_status: sub.status,
      current_period_end: getPeriodEnd(sub),
    })
    .eq("stripe_customer_id", customerId);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      serverEnv().STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("[stripe] signature verification failed:", error);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await syncSubscription(event.data.object);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const admin = createAdminClient();
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await admin
          .from("profiles")
          .update({
            plan: "free",
            subscription_status: "canceled",
            stripe_subscription_id: null,
            current_period_end: null,
          })
          .eq("stripe_customer_id", customerId);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("[stripe] webhook handler error:", error);
    return NextResponse.json({ error: "Erreur de traitement" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
