import type { Metadata } from "next";

export const metadata: Metadata = { title: "Politique de confidentialité (RGPD)" };

export default function ConfidentialitePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">
        Politique de confidentialité
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Dernière mise à jour : {new Date().getFullYear()}
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
        <p className="text-muted-foreground">
          Preuvio attache une grande importance à la protection des données
          personnelles, conformément au Règlement Général sur la Protection des
          Données (RGPD).
        </p>

        <section>
          <h2 className="text-lg font-semibold">Données collectées</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <strong>Titulaires de compte</strong> : email, nom (facultatif),
              et données de facturation gérées par Stripe.
            </li>
            <li>
              <strong>Auteurs de témoignages</strong> : nom, rôle, email
              (facultatif, non publié), photo et contenu du témoignage, soumis
              volontairement avec consentement explicite de publication.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Finalités</h2>
          <p className="mt-2 text-muted-foreground">
            Les données servent à fournir le service (collecte et affichage de
            témoignages), gérer les abonnements et, le cas échéant, notifier les
            créateurs des nouveaux témoignages.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Base légale &amp; consentement</h2>
          <p className="mt-2 text-muted-foreground">
            La publication d&apos;un témoignage repose sur le consentement
            explicite de son auteur, recueilli au moment de la soumission. Ce
            consentement peut être retiré à tout moment en contactant
            l&apos;éditeur.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Hébergement &amp; sous-traitants</h2>
          <p className="mt-2 text-muted-foreground">
            Les données sont hébergées dans l&apos;Union européenne (Supabase,
            Vercel). Les paiements sont traités par Stripe et les emails par
            Resend, agissant comme sous-traitants.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Vos droits</h2>
          <p className="mt-2 text-muted-foreground">
            Vous disposez d&apos;un droit d&apos;accès, de rectification,
            d&apos;effacement et de portabilité de vos données. Pour
            l&apos;exercer, contactez : [email de contact].
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            (À compléter avec votre adresse de contact avant la mise en
            production.)
          </p>
        </section>
      </div>
    </article>
  );
}
