# Guide complet — Preuvio 🚀

Ce guide vous accompagne de **zéro** jusqu'à un SaaS **en ligne et utilisable**.
Deux grandes parties :

1. **Mettre Preuvio en marche** (services à créer, configuration, mise en ligne).
2. **Utiliser Preuvio** au quotidien (collecter, modérer, afficher, facturer).

> 📌 Prérequis : une adresse e-mail, et la capacité de créer 3 comptes gratuits
> (Supabase, Stripe, Vercel). Aucune carte bancaire n'est nécessaire pour
> commencer (Stripe fonctionne en **mode test**).

---

## 🧭 Vue d'ensemble

Preuvio repose sur 3 briques externes (toutes avec une offre gratuite) :

| Brique | Rôle | Compte |
|---|---|---|
| **Supabase** | Base de données + comptes utilisateurs + stockage des fichiers | [supabase.com](https://supabase.com) |
| **Stripe** | Paiements (abonnement Pro) | [stripe.com](https://stripe.com) |
| **Vercel** | Héberge le site (l'application Next.js) | [vercel.com](https://vercel.com) |
| _Resend (optionnel)_ | Envoi des e-mails de notification | [resend.com](https://resend.com) |

Le principe : on configure ces services, on copie quelques clés dans des
**variables d'environnement**, et on déploie. Comptez **30 à 45 minutes** la
première fois.

---

# PARTIE 1 — Mettre Preuvio en marche

Vous avez deux options. **L'option A (en ligne) est recommandée** : c'est elle
qui vous donne un vrai SaaS avec une adresse web. L'option B sert à tester sur
votre ordinateur.

## Option A — En ligne (Vercel) ✅ recommandée

### Étape 1 — Base de données (Supabase)

1. Créez un projet sur [supabase.com](https://supabase.com). **Choisissez une
   région européenne** (Paris/Francfort) pour le RGPD.
2. Ouvrez **SQL Editor** et exécutez les deux migrations **dans l'ordre** :
   - collez le contenu de `supabase/migrations/0001_init.sql` → **Run** ;
   - puis `supabase/migrations/0002_hardening.sql` → **Run**.
   > Cela crée les tables, la sécurité (RLS), le déclencheur d'inscription, et
   > le bucket de stockage `media`.
3. Allez dans **Project Settings → API** et notez 3 valeurs :
   - `Project URL`
   - clé `anon public`
   - clé `service_role` (⚠️ **secrète** — ne la partagez jamais publiquement)
4. **Authentication → Providers → Email** : activez l'e-mail. Pour démarrer sans
   friction, vous pouvez désactiver « Confirm email » (à réactiver en vraie prod
   avec un SMTP configuré).
5. **Authentication → URL Configuration** : mettez votre futur domaine dans
   `Site URL`, et ajoutez `https://VOTRE-DOMAINE/auth/callback` dans
   **Redirect URLs**. (Vous reviendrez ici après l'étape 3 pour coller l'URL
   Vercel réelle.)

### Étape 2 — Paiements (Stripe, mode test)

1. Sur [stripe.com](https://stripe.com), restez en **mode Test** (interrupteur en
   haut à droite).
2. **Créez un produit** « Preuvio Pro » avec **deux tarifs récurrents** : un
   mensuel et un annuel. Notez les deux **Price ID** (format `price_…`).
3. **Developers → API keys** : notez la **Secret key** (`sk_test_…`).
4. Le **webhook** se configure après le déploiement (étape 4).

### Étape 3 — Déploiement (Vercel)

1. Connectez votre dépôt GitHub `Saas2` à [vercel.com](https://vercel.com)
   (**New Project → Import**).
2. ⚠️ **Framework Preset : choisissez « Next.js »** (et non « Other » — c'est la
   cause du fameux 404 si on l'oublie).
3. Renseignez les **variables d'environnement** (voir le tableau plus bas), puis
   **Deploy**.
4. Une fois déployé, copiez l'URL (`https://….vercel.app`) et :
   - mettez-la dans la variable `NEXT_PUBLIC_SITE_URL` (et redeployez) ;
   - retournez dans Supabase (Étape 1.5) pour mettre cette URL en `Site URL` +
     `…/auth/callback` en Redirect URL.

### Étape 4 — Webhook Stripe (active les abonnements)

1. Stripe → **Developers → Webhooks → Add endpoint**.
2. URL : `https://VOTRE-DOMAINE/api/stripe/webhook`.
3. Événements à écouter : `checkout.session.completed`,
   `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`.
4. Copiez le **Signing secret** (`whsec_…`) dans la variable
   `STRIPE_WEBHOOK_SECRET`, puis redeployez.

✅ **C'est en ligne.** Allez sur votre URL, créez un compte, et passez à la
Partie 2.

---

## Option B — En local (sur votre ordinateur)

Pour tester ou développer. Prérequis : **Node.js 20+** et **pnpm**.

```bash
# 1. Dépendances
pnpm install

# 2. Variables d'environnement
cp .env.example .env.local        # puis remplissez les valeurs (tableau ci-dessous)

# 3. Base de données : exécutez 0001 puis 0002 dans le SQL Editor Supabase
#    (cf. Option A, étape 1)

# 4. (Facultatif) données de démo
pnpm db:seed                       # crée demo@preuvio.app / DemoPreuvio2026!

# 5. Lancer
pnpm dev                           # http://localhost:3000
```

Pour tester les webhooks Stripe en local, installez le
[Stripe CLI](https://stripe.com/docs/stripe-cli) :
`stripe listen --forward-to localhost:3000/api/stripe/webhook` (il vous donne un
`whsec_…` à mettre dans `.env.local`).

---

## 🔑 Variables d'environnement (référence)

À renseigner sur Vercel (Option A) ou dans `.env.local` (Option B). Tout est
aussi documenté dans `.env.example`.

| Variable | Rôle | Où la trouver |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL publique (sans `/` final) | votre domaine Vercel |
| `NEXT_PUBLIC_SUPABASE_URL` | connexion Supabase | Supabase → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé publique Supabase | Supabase → API |
| `SUPABASE_SERVICE_ROLE_KEY` 🔒 | opérations serveur | Supabase → API |
| `STRIPE_SECRET_KEY` 🔒 | Stripe | Stripe → API keys |
| `STRIPE_WEBHOOK_SECRET` 🔒 | signature des webhooks | Stripe → Webhooks |
| `STRIPE_PRICE_PRO_MONTHLY` | tarif Pro mensuel | Stripe → produit |
| `STRIPE_PRICE_PRO_YEARLY` | tarif Pro annuel | Stripe → produit |
| `RESEND_API_KEY` _(opt.)_ | e-mails de notification | Resend → API keys |
| `EMAIL_FROM` _(opt.)_ | expéditeur des e-mails | ex. `Preuvio <hello@votre-domaine>` |

> 🔒 = secret. Les e-mails (Resend) sont **facultatifs** : sans clé, l'app
> fonctionne, elle n'envoie simplement pas de notification.

---

# PARTIE 2 — Utiliser Preuvio

### 1. Créer votre compte
Allez sur votre site → **S'inscrire**. Vous arrivez sur le **tableau de bord**.

### 2. Créer un « espace de collecte »
Un *espace* = une campagne de collecte (souvent une marque ou un produit).
- Cliquez sur **Créer un espace**, donnez un nom.
- Dans **Réglages**, personnalisez : accroche, message d'intro, couleur de
  marque, logo, et ce que vous demandez (note ⭐, photo, vidéo — la **vidéo est
  réservée au plan Pro**).

### 3. Collecter des témoignages
- Onglet **Partager** : vous obtenez un **lien public** (`/c/votre-espace`) et un
  **QR code**. Envoyez-les à vos clients (e-mail, réseaux, après-vente…).
- Vos clients laissent leur témoignage **sans créer de compte**. Avec consentement
  RGPD explicite.

### 4. Modérer (boîte de réception)
- Onglet principal de l'espace : chaque témoignage arrive en **En attente**.
- Vous pouvez **Approuver**, **Archiver**, **Mettre en avant** (⭐ featured),
  rechercher et filtrer.
- Seuls les témoignages **approuvés** sont visibles publiquement.

### 5. Afficher : le « Mur de témoignages »
- Onglet **Widget** : choisissez la mise en page (mur / grille / carrousel), le
  thème, le nombre de colonnes.
- Deux façons d'afficher :
  - **Page hébergée** : `/mur/votre-espace` (un lien public prêt à partager) ;
  - **Embed** : copiez le petit script et collez-le sur **n'importe quel site**
    (il s'adapte tout seul à la hauteur).

### 6. Passer en Pro (facturation)
- **Tableau de bord → Facturation** : bouton pour passer au plan **Pro**
  (Checkout Stripe). En mode test, utilisez la carte **`4242 4242 4242 4242`**,
  une date future et n'importe quel CVC.
- Le plan se met à jour automatiquement après le paiement (via le webhook).
- Le **portail client** Stripe permet de gérer/annuler l'abonnement.

| | **Gratuit** | **Pro** |
|---|---|---|
| Espaces | 1 | illimité |
| Témoignages / espace | 15 | illimité |
| Widgets / espace | 1 | illimité |
| Témoignages vidéo | — | ✅ |
| Ajout manuel | — | ✅ |
| Retrait du « Propulsé par Preuvio » + thèmes | — | ✅ |

---

## ✅ Checklist de mise en production

- [ ] Migrations `0001` **et** `0002` exécutées sur Supabase
- [ ] Région Supabase = UE (RGPD)
- [ ] Framework Preset Vercel = **Next.js**
- [ ] Toutes les variables d'environnement renseignées
- [ ] `NEXT_PUBLIC_SITE_URL` = vraie URL ; `Site URL` + Redirect URL Supabase à jour
- [ ] Webhook Stripe créé et `STRIPE_WEBHOOK_SECRET` renseigné
- [ ] Test de bout en bout : inscription → espace → témoignage → approbation →
      widget → passage Pro (carte test)
- [ ] Pour la vraie prod : SMTP Supabase configuré + « Leaked password
      protection » activée + bascule Stripe en mode **Live**

---

## 🆘 Dépannage rapide

| Symptôme | Cause probable / solution |
|---|---|
| Page **404** après déploiement | Framework Preset Vercel sur « Other » → mettre **Next.js** et redéployer |
| Connexion impossible / « lien expiré » | `Site URL` + `…/auth/callback` manquants dans Supabase → URL Configuration |
| Le plan reste « Gratuit » après paiement | Webhook Stripe absent ou mauvais `STRIPE_WEBHOOK_SECRET` |
| Erreur de variables au démarrage | une variable d'env manque (voir le tableau) |
| Les e-mails ne partent pas | normal sans `RESEND_API_KEY` (notifications désactivées) |

---

📚 Pour aller plus loin : `README.md` (démarrage dev), `DEPLOY.md` (procédure de
déploiement détaillée), `PLAN.md` (architecture), `TEST_REPORT.md` (qualité).
