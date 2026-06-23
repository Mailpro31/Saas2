# PLAN.md — Phase 2 : Spécification & Architecture (Preuvio)

> Produit : **Preuvio** — plateforme FR-native de collecte & affichage de témoignages clients.
> Principe : **profondeur sur le cœur** (4 fonctionnalités vraiment abouties) plutôt que largeur.

---

## 1. Proposition de valeur (une phrase)

**Preuvio aide les créateurs, freelances et fondateurs de SaaS francophones à transformer leurs clients satisfaits en preuve sociale : collectez des témoignages (texte & vidéo) via une page partageable, puis affichez-les partout grâce à un « Mur de témoignages » embeddable — en français, conforme RGPD.**

---

## 2. User stories (MoSCoW)

### Must (cœur du MVP — sans elles, pas de produit)
- **M1** — En tant que créateur, je m'inscris / me connecte (email + mot de passe) pour accéder à mon tableau de bord.
- **M2** — Je crée un **espace de collecte** (nom, slug, accroche, couleur de marque) qui génère une **page publique partageable**.
- **M3** — Un client ouvre ma page publique et **soumet un témoignage** (nom, rôle, note, texte, consentement RGPD) sans créer de compte.
- **M4** — Je vois les témoignages reçus dans une **boîte de réception**, je peux **approuver / rejeter / archiver / mettre en avant** chacun.
- **M5** — Je génère un **widget « Mur de témoignages »** et je copie un **code d'intégration** (script + iframe) à coller sur mon site ; le mur affiche uniquement les témoignages approuvés.
- **M6** — Une **page publique hébergée** (`/mur/[slug]`) affiche le mur, partageable directement.
- **M7** — Je peux **m'abonner au plan Pro** via Stripe (Checkout) et **gérer mon abonnement** (Customer Portal) ; les limites du plan gratuit sont appliquées côté serveur.

### Should (fortement souhaitable, inclus si le temps le permet — la plupart le seront)
- **S1** — Soumission de **témoignage vidéo** (upload fichier, lecture native) — réservé Pro.
- **S2** — **Import / ajout manuel** d'un témoignage (le créateur saisit lui-même un témoignage reçu par email/DM).
- **S3** — **Personnalisation du widget** (mise en page mur/grille/carrousel, thème clair/sombre, nb de colonnes, afficher/masquer note & avatar).
- **S4** — **Notification email** au créateur à chaque nouveau témoignage (Resend, dégradation gracieuse).
- **S5** — **Recherche & filtres** dans la boîte de réception (statut, note, type, texte).
- **S6** — **Statistiques** simples par espace (nb de témoignages, taux d'approbation, note moyenne).
- **S7** — **Upload d'avatar** & logo d'espace.

### Could (bonus si tout le reste est solide)
- **C1** — Mode sombre de l'application.
- **C2** — Export CSV des témoignages.
- **C3** — Multiples widgets par espace avec configs distinctes.
- **C4** — Badge « Propulsé par Preuvio » cliquable (boucle virale) sur le plan gratuit.

### Won't (hors périmètre MVP — anti-scope-creep)
- ❌ Import automatique depuis Twitter/X, LinkedIn, Google Reviews, Trustpilot (API tierces).
- ❌ Transcodage vidéo / streaming adaptatif (lecture native uniquement, taille plafonnée).
- ❌ Équipes / multi-utilisateurs par compte (1 compte = 1 propriétaire).
- ❌ IA (génération/résumé de témoignages).
- ❌ Marque blanche complète / domaine personnalisé.
- ❌ Webhooks sortants, API publique.
- ❌ A/B testing des murs, analytics avancées.

---

## 3. Périmètre explicite

**Le MVP FAIT :** auth email/mot de passe · espaces de collecte avec page publique · soumission publique texte+vidéo avec consentement RGPD · boîte de réception avec workflow d'approbation · widget mur embeddable (script+iframe) + page publique hébergée · personnalisation widget · facturation Stripe (Free/Pro) avec gating serveur · notifications email · seed de démo · responsive + accessibilité de base.

**Le MVP NE FAIT PAS :** imports réseaux sociaux · transcodage vidéo · équipes · IA · API publique · domaine custom (cf. _Won't_).

---

## 4. Schéma de données (PostgreSQL / Supabase)

```
auth.users (géré par Supabase Auth)
   │ 1:1 (trigger à l'inscription)
   ▼
profiles
   id                uuid    PK, = auth.users.id
   email             text    not null
   full_name         text
   plan              text    not null default 'free'   -- 'free' | 'pro'
   stripe_customer_id     text
   stripe_subscription_id text
   subscription_status    text                          -- 'active'|'trialing'|'canceled'|...
   current_period_end     timestamptz
   created_at        timestamptz default now()
   │ 1:N
   ▼
spaces
   id            uuid    PK default gen_random_uuid()
   owner_id      uuid    FK → profiles.id  (on delete cascade), not null
   name          text    not null
   slug          text    not null UNIQUE                -- URL publique
   headline      text    not null default '...'         -- accroche affichée au client
   description   text
   brand_color   text    not null default '#6366f1'     -- hex validé
   logo_url      text
   collect_rating  bool  not null default true
   collect_avatar  bool  not null default true
   collect_video   bool  not null default false         -- Pro
   thank_you_message text not null default '...'
   created_at    timestamptz default now()
   CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]{3,40}$')
   │ 1:N
   ▼
testimonials
   id            uuid    PK default gen_random_uuid()
   space_id      uuid    FK → spaces.id (on delete cascade), not null
   author_name   text    not null
   author_email  text
   author_role   text                                   -- « CEO, Acme » / « Cliente »
   author_avatar_url text
   rating        int     CHECK (rating BETWEEN 1 AND 5)
   content       text    not null
   type          text    not null default 'text'        -- 'text' | 'video'
   video_url     text
   source        text    not null default 'form'        -- 'form' | 'manual'
   status        text    not null default 'pending'     -- 'pending'|'approved'|'archived'
   featured      bool    not null default false
   consent       bool    not null default false         -- RGPD : autorisation de publication
   created_at    timestamptz default now()
   approved_at   timestamptz

widgets
   id            uuid    PK default gen_random_uuid()
   space_id      uuid    FK → spaces.id (on delete cascade), not null
   name          text    not null default 'Mur de témoignages'
   layout        text    not null default 'wall'        -- 'wall'|'grid'|'carousel'
   theme         text    not null default 'light'       -- 'light'|'dark'
   columns       int     not null default 3 CHECK (columns BETWEEN 1 AND 4)
   show_rating   bool    not null default true
   show_avatar   bool    not null default true
   show_branding bool    not null default true          -- forcé true en Free
   created_at    timestamptz default now()
```

**Index** : `spaces(owner_id)`, `spaces(slug)`, `testimonials(space_id, status)`, `widgets(space_id)`.

**RLS (Row Level Security)** — activée sur toutes les tables :
- `profiles` : SELECT/UPDATE où `id = auth.uid()`.
- `spaces` : SELECT **public** (storefront public) ; INSERT/UPDATE/DELETE où `owner_id = auth.uid()`.
- `testimonials` : SELECT public **uniquement** `status = 'approved'` ; le propriétaire (via jointure espace) voit tout et peut UPDATE/DELETE ; **pas d'INSERT public via RLS**.
- `widgets` : SELECT public ; CUD propriétaire.

**Opérations sensibles via server actions (client service-role, validé Zod)** :
- Soumission publique d'un témoignage (insert `pending`) → évite une policy anon trop permissive ; honeypot + validation.
- Upload média (avatar/vidéo) vers Supabase Storage (bucket public `media`, type/taille validés).
- Sync Stripe (webhook) → met à jour `profiles`.

---

## 5. Architecture (routes & composants)

```
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                 # Landing
│   │   ├── tarifs/page.tsx          # Pricing
│   │   ├── mentions-legales/page.tsx
│   │   └── confidentialite/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── auth/
│   │   ├── callback/route.ts        # échange code → session (magic link / confirm)
│   │   └── signout/route.ts
│   ├── dashboard/
│   │   ├── layout.tsx               # garde auth + nav ; charge profile
│   │   ├── page.tsx                 # liste des espaces + onboarding
│   │   ├── [spaceId]/
│   │   │   ├── page.tsx             # boîte de réception (témoignages)
│   │   │   ├── widgets/page.tsx     # éditeur de widget + code d'intégration
│   │   │   ├── share/page.tsx       # lien de collecte + QR
│   │   │   └── settings/page.tsx    # réglages de l'espace
│   │   ├── billing/page.tsx         # plan & abonnement
│   │   └── settings/page.tsx        # compte
│   ├── c/[slug]/page.tsx            # PAGE PUBLIQUE de collecte (formulaire client)
│   ├── mur/[slug]/page.tsx          # PAGE PUBLIQUE du mur (hébergée)
│   ├── embed/[widgetId]/page.tsx    # vue embeddable (sans chrome, framable)
│   ├── api/
│   │   └── stripe/webhook/route.ts  # webhook Stripe (signature vérifiée)
│   ├── layout.tsx                   # root (fonts, Toaster, ThemeProvider)
│   └── globals.css
├── components/
│   ├── ui/                          # shadcn (écrits à la main)
│   ├── marketing/                   # Hero, Features, PricingCards, Footer, Navbar
│   ├── dashboard/                   # Sidebar, SpaceCard, TestimonialInbox, TestimonialRow...
│   ├── collection/                  # CollectionForm, RatingInput, VideoUpload, ThankYou
│   ├── wall/                        # WallOfLove, TestimonialCard, layouts
│   └── billing/                     # UpgradeButton, ManageSubscriptionButton
├── lib/
│   ├── supabase/{client,server,middleware,admin}.ts
│   ├── stripe/{server,plans}.ts
│   ├── actions/{spaces,testimonials,widgets,billing,media}.ts   # server actions
│   ├── validations/*.ts             # schémas Zod
│   ├── email/resend.ts
│   ├── plans.ts                     # limites Free/Pro
│   ├── env.ts                       # accès env validé
│   └── utils.ts
├── middleware.ts                    # refresh session Supabase
└── scripts/seed.ts                  # données de démo
```

**Server actions** (mutations, `'use server'`, validation Zod systématique) :
- `spaces.ts` : `createSpace`, `updateSpace`, `deleteSpace`.
- `testimonials.ts` : `submitTestimonial` (public), `updateTestimonialStatus`, `toggleFeatured`, `addManualTestimonial`, `deleteTestimonial`.
- `widgets.ts` : `upsertWidget`.
- `billing.ts` : `createCheckoutSession`, `createPortalSession`.
- `media.ts` : `uploadMedia`.

---

## 6. Parcours utilisateur principal (du landing à la valeur)

1. **Découverte** → landing `/` : proposition de valeur, démo de mur, CTA « Commencer gratuitement ».
2. **Inscription** → `/signup` (email + mot de passe) → confirmation → `/dashboard`.
3. **Création d'espace** → onboarding : nom (« Ma formation Copywriting »), slug auto, couleur → espace créé.
4. **Partage** → `/dashboard/[id]/share` : copie le lien `preuvio.app/c/ma-formation` (+ QR) et l'envoie à ses clients.
5. **Collecte** → le client ouvre `/c/ma-formation`, remplit le formulaire (note, texte, nom, rôle, consentement), valide → écran de remerciement.
6. **Modération** → le créateur reçoit une notif email, ouvre la boîte de réception, **approuve** les bons témoignages.
7. **Affichage** → `/dashboard/[id]/widgets` : il personnalise le mur, copie le **code d'intégration**, le colle sur sa page de vente → **preuve sociale en ligne** (valeur délivrée).
8. **Monétisation** → en atteignant les limites (vidéo, 2ᵉ espace, retrait branding) → `/dashboard/billing` → **Checkout Stripe** → Pro débloqué.

---

## 7. Flux d'authentification & de paiement

### Auth (Supabase Auth)
- **Inscription** : email + mot de passe. Un **trigger Postgres** `on_auth_user_created` insère la ligne `profiles` (plan `free`).
- **Confirmation** : email de confirmation Supabase → `/auth/callback` échange le code contre une session.
- **Connexion** : email/mot de passe ; magic link optionnel.
- **Protection** : `dashboard/layout.tsx` appelle `supabase.auth.getUser()` ; si null → redirect `/login`. Le middleware rafraîchit la session à chaque requête.

### Paiement (Stripe, mode test)
- **Plans** (`src/lib/plans.ts`) : `FREE` (1 espace, 15 témoignages, 1 widget, branding forcé, pas de vidéo) · `PRO` (illimité, vidéo, branding retirable, thèmes).
- **Checkout** : server action `createCheckoutSession` → crée/récupère `stripe_customer_id`, crée une session `mode: 'subscription'` (price mensuel/annuel via env), redirige.
- **Webhook** `/api/stripe/webhook` : vérifie la signature (`STRIPE_WEBHOOK_SECRET`), traite `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` → met à jour `profiles.plan/subscription_status/current_period_end` (client service-role).
- **Portal** : `createPortalSession` → page Stripe de gestion (upgrade/cancel/factures).
- **Gating** : chaque server action vérifie le plan + les limites **avant** d'agir (création d'espace au-delà de la limite, activation vidéo, retrait branding). L'UI reflète l'état (badges « Pro », CTA upgrade).

---

## 8. Wireframes textuels (écrans clés)

**Landing `/`**
```
┌──────────────────────────────────────────────────────────┐
│  Preuvio              Fonctionnalités  Tarifs   [Connexion]│
├──────────────────────────────────────────────────────────┤
│   La preuve sociale, en français.                          │
│   Collectez des témoignages clients et affichez-les        │
│   partout. Texte & vidéo. Conforme RGPD.                   │
│   [ Commencer gratuitement ]   [ Voir une démo ]           │
│                                                            │
│   ┌── Mur de témoignages (aperçu animé) ──────────────┐    │
│   │ ⭐⭐⭐⭐⭐ « Génial »  …   ⭐⭐⭐⭐⭐ « Top »  …      │    │
│   └────────────────────────────────────────────────────┘   │
│   [Collecter] → [Modérer] → [Afficher]  (3 étapes)         │
│   Tarifs · FAQ · Footer (mentions, confidentialité)        │
└──────────────────────────────────────────────────────────┘
```

**Page de collecte publique `/c/[slug]`**
```
┌───────────────────────────────────┐
│      [logo]  Ma formation          │
│  « Partagez votre expérience 🙏 »  │
│  Note :  ⭐ ⭐ ⭐ ⭐ ⭐               │
│  Votre témoignage :                │
│  [____________________________]    │
│  Nom* [______]  Rôle [__________]  │
│  Email [__________]  Avatar [⬆]    │
│  ( ) Vidéo (Pro)                   │
│  [x] J'autorise la publication (RGPD)│
│            [ Envoyer ]             │
└───────────────────────────────────┘
```

**Boîte de réception `/dashboard/[spaceId]`**
```
┌── Mon espace : Ma formation ───────── [Partager] [Pro] ──┐
│ Onglets: ▸Témoignages  Widget  Partager  Réglages        │
│ Filtres: [Tous|En attente|Approuvés|Archivés] 🔎[____]    │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ ⭐⭐⭐⭐⭐  Marie D. — Cliente            [En attente] │  │
│ │ « Formation incroyable, j'ai doublé… »               │  │
│ │ [✓ Approuver] [★ Mettre en avant] [Archiver] [🗑]     │  │
│ └─────────────────────────────────────────────────────┘  │
│ … (états : loading / vide « Aucun témoignage » / erreur)  │
└──────────────────────────────────────────────────────────┘
```

**Éditeur de widget `/dashboard/[spaceId]/widgets`**
```
┌── Réglages ─────────┐  ┌── Aperçu en direct ───────────┐
│ Mise en page: [Mur▾]│  │  ⭐⭐⭐⭐⭐  ⭐⭐⭐⭐⭐           │
│ Thème: (•)Clair ( )S│  │  « … »      « … »              │
│ Colonnes: [▭▭▭] 3   │  │  ⭐⭐⭐⭐    ⭐⭐⭐⭐⭐           │
│ [x] Notes [x] Avatar│  │  « … »      « … »              │
│ [ ] Retirer branding│  └───────────────────────────────┘
│ (Pro)               │   Code d'intégration :
└─────────────────────┘   [<script src="…/embed.js" …>] [Copier]
```

**Tarifs `/tarifs`**
```
┌── Gratuit ─────────┐   ┌── Pro — 15€/mois ★ ─────────┐
│ 1 espace           │   │ Espaces illimités            │
│ 15 témoignages     │   │ Témoignages illimités        │
│ 1 widget           │   │ Vidéo · thèmes · sans marque │
│ Badge Preuvio      │   │ Import manuel · stats        │
│ [Commencer]        │   │ [ Passer Pro ]               │
└────────────────────┘   └──────────────────────────────┘
```

---

## 9. Ordre de construction (parcours critique d'abord)

1. **Socle** : env, plans, clients Supabase/Stripe/admin, schéma SQL + RLS + trigger + Storage, composants UI.
2. **Auth** (M1) : login/signup/callback, layout protégé.
3. **Espaces** (M2) : création + liste + réglages.
4. **Collecte publique** (M3) : page `/c/[slug]` + soumission.
5. **Boîte de réception** (M4) : modération.
6. **Widget + embed** (M5, M6) : éditeur, mur public, embed.js.
7. **Stripe** (M7) : checkout, webhook, portal, gating.
8. **Should** : vidéo, manuel, perso widget, email, recherche, stats.
9. **Landing + tarifs + polish + SEO**.
10. **Seed**, tests, revues, déploiement.
