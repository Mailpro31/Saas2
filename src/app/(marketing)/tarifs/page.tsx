import type { Metadata } from "next";
import { PricingCards } from "@/components/marketing/pricing-cards";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Preuvio est gratuit pour démarrer. Passez au Pro à 15€/mois pour tout débloquer.",
};

const FAQ = [
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui. Vous pouvez passer au Pro ou résilier quand vous voulez, depuis votre espace de facturation.",
  },
  {
    q: "Comment se passe le paiement ?",
    a: "Le paiement est géré de façon sécurisée par Stripe. Aucune donnée bancaire ne transite par Preuvio.",
  },
  {
    q: "Que se passe-t-il si je dépasse les limites du plan gratuit ?",
    a: "Vos témoignages existants restent intacts. Pour en collecter davantage ou créer un nouvel espace, il suffit de passer au Pro.",
  },
];

export default function TarifsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Tarifs</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Commencez gratuitement, sans carte bancaire. Passez au Pro quand vous
          êtes prêt à passer à l&apos;échelle.
        </p>
      </div>

      <PricingCards />

      <div className="mx-auto mt-20 max-w-3xl">
        <h2 className="text-center text-2xl font-bold tracking-tight">
          Questions sur les tarifs
        </h2>
        <div className="mt-8 divide-y rounded-2xl border bg-card">
          {FAQ.map((item) => (
            <div key={item.q} className="p-6">
              <h3 className="font-semibold">{item.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
