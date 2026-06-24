"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * After returning from Stripe Checkout (?success=1) the plan flips to "pro"
 * only once the webhook is processed. While still free, re-fetch a couple of
 * times so the UI reflects the upgrade without a manual reload.
 */
export function BillingSuccessSync({ isPro }: { isPro: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (isPro) return;
    // Webhook delivery can lag (cold start, retry). Re-check on a backoff up to
    // ~30s so the upgrade reflects without a manual reload; the page shows an
    // "activation in progress" hint until then.
    const timers = [2000, 4000, 7000, 11000, 16000, 23000, 30000].map((ms) =>
      setTimeout(() => router.refresh(), ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [isPro, router]);
  return null;
}
