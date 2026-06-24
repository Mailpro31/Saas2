# Preuvio — La preuve sociale, en français

Plateforme **FR-native** de collecte et d'affichage de témoignages clients (texte & vidéo) pour créateurs, freelances, coachs et fondateurs de SaaS francophones. Collectez via une page partageable, modérez, puis affichez un **« Mur de témoignages »** embeddable sur n'importe quel site. Conforme RGPD.

> MVP construit de bout en bout — voir `RESEARCH.md` (opportunité & décision), `PLAN.md` (spécification), `TEST_REPORT.md` (QA) et `DEPLOY.md` (déploiement).

## ✨ Fonctionnalités

- **Espaces de collecte** : page publique brandée (lien + QR), sans compte requis côté client.
- **Boîte de réception** : modération (approuver / archiver / mettre en avant), recherche, filtres.
- **Widget embeddable** : « Mur de témoignages » (mosaïque / grille / carrousel, thème, colonnes) + page publique hébergée + script auto-resize.
- **Facturation Stripe** : Free / Pro avec gating serveur, Checkout, Customer Portal, webhooks idempotents.
- Témoignages **vidéo** (Pro), notifications email (Resend), conformité **RGPD** (consentement explicite, hébergement UE).

## 🧱 Stack

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 + shadcn/ui · Supabase (PostgreSQL + Auth + Storage + RLS) · Stripe (mode test) · Resend · Vitest · déploiement Vercel.

## 🚀 Démarrage local

```bash
# 1. Dépendances
pnpm install

# 2. Variables d'environnement
cp .env.example .env.local      # puis renseignez les valeurs (voir DEPLOY.md §1-2)

# 3. Base de données : dans le SQL Editor Supabase, exécutez DANS L'ORDRE
#    supabase/migrations/0001_init.sql puis supabase/migrations/0002_hardening.sql

# 4. (Optionnel) données de démo
pnpm db:seed                    # → demo@preuvio.app / DemoPreuvio2026!

# 5. Lancer
pnpm dev                        # http://localhost:3000
```

## 🔑 Variables d'environnement

Toutes documentées dans [`.env.example`](./.env.example) :

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL publique (sans slash final) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Connexion Supabase (client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Opérations serveur (RLS bypass) — **secret** |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe — **secrets** |
| `STRIPE_PRICE_PRO_MONTHLY` / `STRIPE_PRICE_PRO_YEARLY` | IDs de prix Pro |
| `RESEND_API_KEY` / `EMAIL_FROM` | Emails (optionnel, dégradation gracieuse) |

## 📂 Structure

```
src/
├── app/
│   ├── (marketing)/        # landing, tarifs, mentions légales, confidentialité
│   ├── (auth)/             # login, signup + server actions
│   ├── auth/callback/      # échange du code OAuth/magic-link
│   ├── dashboard/          # espace authentifié (espaces, inbox, widget, partage, facturation)
│   ├── c/[slug]/           # page de collecte publique
│   ├── mur/[slug]/         # mur public hébergé
│   ├── embed/[widgetId]/   # vue embeddable (framable)
│   └── api/stripe/webhook/ # webhook Stripe (signature + idempotence)
├── components/             # ui (shadcn), dashboard, collection, wall, marketing, billing
├── lib/
│   ├── actions/            # server actions (Zod + gating de plan)
│   ├── supabase/           # clients browser/server/admin + types
│   ├── stripe/             # client Stripe
│   ├── validations/        # schémas Zod
│   ├── queries.ts          # lectures owner (RLS) vs publiques (service-role)
│   ├── plans.ts · env.ts · rate-limit.ts · auth.ts · slug.ts
├── proxy.ts                # refresh session Supabase + headers de sécurité
supabase/migrations/        # schéma + RLS + trigger + storage
scripts/seed.ts             # données de démo
```

## 🔒 Sécurité

- **RLS** : aucune table n'est lisible directement par le rôle anon ; les pages publiques lisent server-side via le client service-role (jamais exposé au navigateur).
- Validation **Zod** côté serveur sur chaque entrée ; uploads validés par **magic-bytes** ; rate-limiting sur les endpoints publics.
- Webhook Stripe à signature vérifiée + idempotent ; en-têtes de sécurité (X-Frame-Options, CSP, nosniff, HSTS) via le proxy.
- Aucun secret en dur ; secrets `server-only`.

## 🧪 Qualité

```bash
pnpm typecheck   # TypeScript strict
pnpm lint        # ESLint
pnpm test        # 38 tests Vitest (logique métier)
pnpm build       # build de production
```

## 📦 Déploiement

Voir [`DEPLOY.md`](./DEPLOY.md) pour la procédure Vercel + Supabase + Stripe complète et la checklist post-déploiement.

---

_Projet de démonstration. La preuve sociale affichée sur la landing est illustrative (exemples)._
