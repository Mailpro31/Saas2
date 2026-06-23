import type { Metadata } from "next";
import { Check, Sparkles } from "lucide-react";
import { requireSession } from "@/lib/auth";
import {
  UpgradeButtons,
  ManageSubscriptionButton,
} from "@/components/billing/billing-actions";
import { BillingSuccessSync } from "@/components/billing/billing-success-sync";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Facturation" };

const PRO_FEATURES = [
  "Espaces de collecte illimités",
  "Témoignages illimités",
  "Témoignages vidéo",
  "Widgets illimités & thème sombre",
  "Retrait du badge « Preuvio »",
  "Ajout manuel de témoignages",
];

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const { profile } = await requireSession();
  const sp = await searchParams;
  const isPro = profile.plan === "pro";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Facturation</h1>
        <p className="text-sm text-muted-foreground">
          Gérez votre abonnement Preuvio.
        </p>
      </div>

      {sp.success ? (
        <>
          <BillingSuccessSync isPro={isPro} />
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
            <Sparkles className="size-4" />
            <AlertDescription className="text-emerald-900">
              {isPro
                ? "Bienvenue dans Preuvio Pro ! Toutes les fonctionnalités sont débloquées."
                : "Paiement reçu — activation de votre abonnement en cours…"}
            </AlertDescription>
          </Alert>
        </>
      ) : null}
      {sp.canceled ? (
        <Alert>
          <AlertDescription>
            Paiement annulé. Vous pouvez réessayer à tout moment.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Plan {isPro ? "Pro" : "Gratuit"}
                {isPro ? <Badge>Actif</Badge> : null}
              </CardTitle>
              <CardDescription>
                {isPro
                  ? profile.current_period_end
                    ? `Prochain renouvellement le ${formatDate(profile.current_period_end)}.`
                    : "Abonnement actif."
                  : "Vous utilisez la version gratuite."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isPro ? (
            <ManageSubscriptionButton />
          ) : (
            <div className="space-y-5">
              <ul className="grid gap-2 sm:grid-cols-2">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <UpgradeButtons />
              <p className="text-xs text-muted-foreground">
                Paiement sécurisé par Stripe. Résiliable à tout moment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
