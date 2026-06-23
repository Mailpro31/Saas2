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
    const timers = [2500, 6000].map((ms) =>
      setTimeout(() => router.refresh(), ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [isPro, router]);
  return null;
}
