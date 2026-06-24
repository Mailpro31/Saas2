# DEPLOY.md — Déploiement sur Vercel

Procédure complète pour déployer **Preuvio** en production. Temps estimé : ~30 min.

---

## 0. Pré-requis

- Un compte **Vercel**, **Supabase** et **Stripe**.
- Le repo poussé sur GitHub.
- (Optionnel) Un compte **Resend** pour les emails transactionnels.

---

## 1. Base de données — Supabase

1. Créez un projet sur [supabase.com](https://supabase.com) (région **EU** — Francfort/Paris — pour le RGPD).
2. **SQL Editor** → exécutez les migrations **dans l'ordre** :
   - `supabase/migrations/0001_init.sql` → **Run** (tables, RLS, trigger d'inscription, table `stripe_events`, bucket Storage `media`).
   - `supabase/migrations/0002_hardening.sql` → **Run** (plafond de témoignages anti-race au niveau base).
3. **Project Settings → API** → notez :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`
4. **Authentication → Providers → Email** : activez Email. Pour la prod, configurez un SMTP (sinon les emails de confirmation Supabase ne partent pas) ou désactivez « Confirm email » pour un onboarding sans friction.
5. **Authentication → URL Configuration** : `Site URL` = votre domaine, et ajoutez `https://votre-domaine.com/auth/callback` aux **Redirect URLs**.
6. ✅ **Recommandé** : Authentication → Policies → activez **« Leaked password protection »**.

---

## 2. Paiements — Stripe (test puis live)

1. Dashboard Stripe → **Products** → créez le produit **Preuvio Pro** avec :
   - un prix **mensuel récurrent** 15 €/mois → notez l'ID `price_...` → `STRIPE_PRICE_PRO_MONTHLY`
   - (optionnel) un prix **annuel** 144 €/an → `STRIPE_PRICE_PRO_YEARLY`
2. **Developers → API keys** → `Secret key` → `STRIPE_SECRET_KEY` (utilisez `sk_test_...` d'abord).
3. Le webhook est configuré à l'étape 4 (après le 1er déploiement, quand l'URL existe).

---

## 3. Déploiement — Vercel

1. [vercel.com/new](https://vercel.com/new) → importez le repo GitHub. Framework détecté : **Next.js**.
2. **Environment Variables** — ajoutez (Production + Preview) :

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://votre-domaine.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | (étape 1.3) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (étape 1.3) |
| `SUPABASE_SERVICE_ROLE_KEY` | (étape 1.3) — **secret** |
| `STRIPE_SECRET_KEY` | (étape 2.2) — **secret** |
| `STRIPE_WEBHOOK_SECRET` | (étape 4) — **secret** |
| `STRIPE_PRICE_PRO_MONTHLY` | (étape 2.1) |
| `STRIPE_PRICE_PRO_YEARLY` | (étape 2.1, optionnel) |
| `RESEND_API_KEY` | (optionnel) |
| `EMAIL_FROM` | `Preuvio <notifications@votre-domaine.com>` (optionnel) |

3. **Deploy**. Notez l'URL de production (puis branchez votre domaine custom et mettez `NEXT_PUBLIC_SITE_URL` à jour).

---

## 4. Webhook Stripe (production)

1. Dashboard Stripe → **Developers → Webhooks → Add endpoint**.
2. URL : `https://votre-domaine.com/api/stripe/webhook`
3. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copiez le **Signing secret** (`whsec_...`) → variable Vercel `STRIPE_WEBHOOK_SECRET` → **redeploy**.

**Test local du webhook** (Stripe CLI) :
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copiez le whsec_... affiché dans .env.local, puis dans un autre terminal :
stripe trigger checkout.session.completed
```

---

## 5. Données de démo (optionnel)

```bash
# .env.local renseigné avec les clés Supabase :
pnpm db:seed
# → crée demo@preuvio.app / DemoPreuvio2026! avec 1 espace et 12 témoignages
```

---

## 6. Checklist de vérification post-déploiement

- [ ] La landing `/` s'affiche, le mur de démo s'anime.
- [ ] Inscription → confirmation → accès `/dashboard`.
- [ ] Création d'un espace → un widget par défaut existe → code d'intégration disponible.
- [ ] Page de collecte `/c/[slug]` : soumission d'un témoignage (texte + note + consentement) → écran de remerciement.
- [ ] Le témoignage apparaît en « En attente » dans la boîte de réception → **Approuver**.
- [ ] Le mur public `/mur/[slug]` et l'embed affichent le témoignage approuvé.
- [ ] Coller le snippet d'intégration sur une page externe → l'iframe s'affiche et s'auto-redimensionne.
- [ ] Facturation : **Passer Pro** → Checkout Stripe (carte test `4242 4242 4242 4242`) → retour → plan « Pro » actif (après webhook).
- [ ] **Gérer l'abonnement** ouvre le Customer Portal.
- [ ] Headers de sécurité présents (`curl -I https://votre-domaine.com` → `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).
- [ ] `/embed/[id]` est framable (pas de `X-Frame-Options` sur cette route).

---

## 7. Recommandations production (au-delà du MVP)

- **Rate-limiting durable** : le limiter actuel est en mémoire (par instance). En prod multi-instance, brancher **Upstash Redis / Vercel KV** et dériver l'IP de l'en-tête de confiance de la plateforme (`x-vercel-forwarded-for`), ou activer le **WAF Vercel** sur `/api` et les server actions publiques.
- **Stripe** : basculer les clés `sk_test_` → `sk_live_` et recréer le webhook en mode live.
- **Emails** : vérifier le domaine d'envoi Resend (SPF/DKIM).
- **Monitoring** : activer Vercel Analytics + les logs Supabase.
- **Storage** : envisager un transcodage vidéo (Mux/Cloudflare Stream) si l'usage vidéo grandit.

---

## Commandes utiles

```bash
pnpm install          # dépendances
pnpm dev              # dev local (http://localhost:3000)
pnpm build            # build de production
pnpm typecheck        # vérification TypeScript stricte
pnpm lint             # ESLint
pnpm test             # tests Vitest
pnpm db:seed          # données de démo
vercel --prod         # déploiement manuel (si CLI Vercel installée)
```

L'application est dans un état **directement déployable** : build vert, `.env.example` complet, migration SQL unique, aucune dépendance manquante.
