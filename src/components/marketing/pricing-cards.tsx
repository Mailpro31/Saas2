import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Gratuit",
    price: "0€",
    period: "pour toujours",
    description: "Pour démarrer et tester la preuve sociale.",
    cta: "Commencer gratuitement",
    highlighted: false,
    features: [
      "1 espace de collecte",
      "Jusqu'à 15 témoignages",
      "1 widget « Mur de témoignages »",
      "Page publique hébergée",
      "Conforme RGPD",
    ],
  },
  {
    name: "Pro",
    price: "15€",
    period: "par mois",
    description: "Pour les créateurs qui veulent tout débloquer.",
    cta: "Passer au Pro",
    highlighted: true,
    features: [
      "Espaces & témoignages illimités",
      "Témoignages vidéo",
      "Widgets illimités + thème sombre",
      "Sans badge « Preuvio »",
      "Ajout manuel de témoignages",
      "Support prioritaire",
    ],
  },
];

export function PricingCards() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
      {PLANS.map((plan) => (
        <div
          key={plan.name}
          className={cn(
            "relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm",
            plan.highlighted && "border-primary shadow-md ring-1 ring-primary/20",
          )}
        >
          {plan.highlighted ? (
            <Badge className="absolute -top-3 left-6">Le plus populaire</Badge>
          ) : null}
          <h3 className="text-lg font-semibold">{plan.name}</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight">
              {plan.price}
            </span>
            <span className="text-sm text-muted-foreground">/{plan.period}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {plan.description}
          </p>
          <ul className="mt-6 flex-1 space-y-3">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            asChild
            className="mt-6 w-full"
            variant={plan.highlighted ? "default" : "outline"}
          >
            <Link href="/signup">{plan.cta}</Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
