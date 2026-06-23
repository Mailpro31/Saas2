"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles, Settings } from "lucide-react";
import {
  createCheckoutSession,
  createPortalSession,
} from "@/lib/actions/billing";
import { Button } from "@/components/ui/button";

export function UpgradeButtons() {
  const [isPending, startTransition] = useTransition();

  function upgrade(interval: "monthly" | "yearly") {
    startTransition(async () => {
      const res = await createCheckoutSession(interval);
      if (res.ok) {
        window.location.href = res.data.url;
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button onClick={() => upgrade("monthly")} disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Sparkles className="size-4" />
        )}
        Passer au Pro — 15€/mois
      </Button>
      <Button
        variant="outline"
        onClick={() => upgrade("yearly")}
        disabled={isPending}
      >
        Annuel — 12€/mois (2 mois offerts)
      </Button>
    </div>
  );
}

export function ManageSubscriptionButton() {
  const [isPending, startTransition] = useTransition();

  function manage() {
    startTransition(async () => {
      const res = await createPortalSession();
      if (res.ok) {
        window.location.href = res.data.url;
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Button variant="outline" onClick={manage} disabled={isPending}>
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Settings className="size-4" />
      )}
      Gérer mon abonnement
    </Button>
  );
}
