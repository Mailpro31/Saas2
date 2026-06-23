import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 prose-preuvio">
      <h1 className="text-3xl font-bold tracking-tight">Mentions légales</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Dernière mise à jour : {new Date().getFullYear()}
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-lg font-semibold">Éditeur du site</h2>
          <p className="mt-2 text-muted-foreground">
            Preuvio — [Nom de la société ou de l&apos;entrepreneur individuel].
            [Adresse]. [SIREN / SIRET]. Directeur de la publication : [Nom].
            Contact : [email].
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            (À compléter avec vos informations légales avant la mise en
            production.)
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Hébergement</h2>
          <p className="mt-2 text-muted-foreground">
            Le site est hébergé par Vercel Inc. et la base de données par
            Supabase, sur des infrastructures situées dans l&apos;Union
            européenne.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Propriété intellectuelle</h2>
          <p className="mt-2 text-muted-foreground">
            L&apos;ensemble des éléments du site (marque, textes, interface) est
            protégé. Toute reproduction sans autorisation est interdite. Les
            témoignages restent la propriété de leurs auteurs, publiés avec leur
            consentement.
          </p>
        </section>
      </div>
    </article>
  );
}
