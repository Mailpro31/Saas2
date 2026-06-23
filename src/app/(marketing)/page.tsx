import Link from "next/link";
import {
  ArrowRight,
  Share2,
  Inbox,
  LayoutGrid,
  ShieldCheck,
  Video,
  Sparkles,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WallOfLove } from "@/components/wall-of-love";
import { PricingCards } from "@/components/marketing/pricing-cards";
import type { TestimonialDisplay } from "@/components/testimonial-card";

const DEMO: TestimonialDisplay[] = [
  {
    author_name: "Sophie Lambert",
    author_role: "Coach business",
    author_avatar_url: null,
    rating: 5,
    content:
      "J'ai collecté 12 témoignages en une semaine, sans relancer personne dix fois. Le lien de collecte fait tout le travail.",
    type: "text",
    video_url: null,
  },
  {
    author_name: "Marc Dubois",
    author_role: "Fondateur, Studio Pixel",
    author_avatar_url: null,
    rating: 5,
    content:
      "Le mur s'intègre en deux minutes sur ma page de vente. Mes conversions ont nettement progressé.",
    type: "text",
    video_url: null,
  },
  {
    author_name: "Inès Caron",
    author_role: "Formatrice en ligne",
    author_avatar_url: null,
    rating: 5,
    content:
      "Enfin un outil de témoignages en français, et conforme RGPD. Mes clients remplissent le formulaire sans friction.",
    type: "text",
    video_url: null,
  },
  {
    author_name: "Thomas Renaud",
    author_role: "Consultant SEO",
    author_avatar_url: null,
    rating: 5,
    content:
      "La modération est limpide : j'approuve d'un clic et le témoignage apparaît sur mon site.",
    type: "text",
    video_url: null,
  },
  {
    author_name: "Awa Diallo",
    author_role: "Designer freelance",
    author_avatar_url: null,
    rating: 5,
    content:
      "Le widget est élégant par défaut. Je l'ai personnalisé en 5 minutes, sans toucher au code.",
    type: "text",
    video_url: null,
  },
  {
    author_name: "Julien Faure",
    author_role: "Indie hacker",
    author_avatar_url: null,
    rating: 4,
    content:
      "Exactement la brique qu'il me manquait pour crédibiliser mon SaaS au lancement.",
    type: "text",
    video_url: null,
  },
];

const STEPS = [
  {
    icon: Share2,
    title: "1. Partagez votre lien",
    text: "Créez un espace et envoyez votre page de collecte à vos clients. Aucun compte requis de leur côté.",
  },
  {
    icon: Inbox,
    title: "2. Modérez en un clic",
    text: "Recevez les témoignages dans votre boîte de réception. Approuvez les meilleurs, archivez le reste.",
  },
  {
    icon: LayoutGrid,
    title: "3. Affichez partout",
    text: "Copiez le code d'intégration et collez votre « Mur de témoignages » sur n'importe quel site.",
  },
];

const FEATURES = [
  {
    icon: Inbox,
    title: "Collecte sans friction",
    text: "Une page de collecte brandée, partageable par lien ou QR code. Texte, note en étoiles et photo.",
  },
  {
    icon: Video,
    title: "Témoignages vidéo",
    text: "Laissez vos clients enregistrer ou envoyer une vidéo. Rien de plus convaincant qu'un visage.",
  },
  {
    icon: Code,
    title: "Widget embeddable",
    text: "Un mur élégant à intégrer en une ligne sur WordPress, Webflow, Systeme.io, Notion ou en pur HTML.",
  },
  {
    icon: ShieldCheck,
    title: "Conforme RGPD",
    text: "Consentement explicite à la soumission, hébergement européen. La confiance, en français.",
  },
];

const FAQ = [
  {
    q: "Ai-je besoin de savoir coder ?",
    a: "Non. Vous partagez un lien pour collecter, et vous collez un petit code (copier-coller) pour afficher le mur. C'est tout.",
  },
  {
    q: "Mes clients doivent-ils créer un compte ?",
    a: "Jamais. Ils ouvrent votre page de collecte et envoient leur témoignage en moins d'une minute.",
  },
  {
    q: "Puis-je commencer gratuitement ?",
    a: "Oui, le plan gratuit permet de collecter jusqu'à 15 témoignages et d'afficher un mur, pour toujours.",
  },
  {
    q: "Est-ce conforme au RGPD ?",
    a: "Oui. Chaque témoignage est soumis avec un consentement explicite de publication, et les données sont hébergées en Europe.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <Badge variant="secondary" className="mb-5">
            <Sparkles className="size-3.5" /> La preuve sociale, en français
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Transformez vos clients satisfaits en{" "}
            <span className="text-primary">preuve sociale</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted-foreground">
            Collectez des témoignages clients (texte &amp; vidéo) et affichez-les
            partout grâce à un mur embeddable. Simple, élégant, conforme RGPD.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">
                Commencer gratuitement <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#comment">Voir comment ça marche</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Gratuit pour toujours · Sans carte bancaire
          </p>
        </div>
      </section>

      {/* Demo wall */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-4 flex items-center justify-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <span className="h-px w-8 bg-border" />
          Exemple de mur de témoignages
          <span className="h-px w-8 bg-border" />
        </div>
        <WallOfLove
          testimonials={DEMO}
          config={{
            layout: "wall",
            theme: "light",
            columns: 3,
            show_rating: true,
            show_avatar: true,
            show_branding: false,
          }}
        />
      </section>

      {/* How it works */}
      <section id="comment" className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            De zéro à preuve sociale en 3 étapes
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <step.icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Tout ce qu&apos;il faut, rien de superflu
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Une boîte à outils complète, pensée pour les créateurs francophones.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6">
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Un tarif simple et honnête
            </h2>
            <p className="mt-3 text-muted-foreground">
              Commencez gratuitement. Passez au Pro quand vous êtes prêt.
            </p>
          </div>
          <PricingCards />
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Questions fréquentes
        </h2>
        <div className="mt-10 divide-y rounded-2xl border bg-card">
          {FAQ.map((item) => (
            <div key={item.q} className="p-6">
              <h3 className="font-semibold">{item.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Prêt à afficher vos premiers témoignages ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
            Créez votre compte gratuit et lancez votre première collecte en
            quelques minutes.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8">
            <Link href="/signup">
              Commencer gratuitement <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
