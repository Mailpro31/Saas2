import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Brand />
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link href="/#fonctionnalites" className="hover:text-foreground">
              Fonctionnalités
            </Link>
            <Link href="/#comment" className="hover:text-foreground">
              Comment ça marche
            </Link>
            <Link href="/tarifs" className="hover:text-foreground">
              Tarifs
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Commencer</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/30">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-2">
            <Brand />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              La preuve sociale, en français. Collectez et affichez vos
              témoignages clients. Conforme RGPD.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Produit</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/#fonctionnalites" className="hover:text-foreground">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="/tarifs" className="hover:text-foreground">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-foreground">
                  Créer un compte
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Légal</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/mentions-legales" className="hover:text-foreground">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:text-foreground">
                  Confidentialité (RGPD)
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t">
          <div className="mx-auto w-full max-w-6xl px-4 py-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Preuvio. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
