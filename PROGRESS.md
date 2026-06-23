# PROGRESS.md — Journal de bord

> Journal continu du projet. Mis à jour à chaque phase.

---

## Phase 0 — Cadrage ✅ (2026-06-23)

- Repo initialisé sur la branche `claude/fervent-cerf-qo0tfn` (vide au départ, aucun commit).
- `BRIEF.md` copié à la racine (fait foi en cas de conflit).
- `STATE.md` créé avec la stack par défaut : Next.js 15 + TS + Tailwind/shadcn + Supabase + Stripe (test) + Resend + Vercel.
- `PROGRESS.md` initialisé (ce fichier).
- **Décision** : on conserve la stack par défaut. Elle est adaptée à un MVP SaaS solo déployable sur Vercel. Adaptation éventuelle documentée dans `STATE.md` après le choix produit.

**Prochaine étape** : Phase 1 — recherche d'opportunité (fan-out d'agents de recherche web, sourçage des MRR, vérification de l'absence de concurrence FR).

---

## Phase 1 — Recherche ✅ (2026-06-23)

_Méthode_ : fan-out de **4 agents de recherche en parallèle** (clusters : preuve sociale/témoignages · croissance/affiliation · feedback/changelog · ops créateurs), chacun renvoyant des findings sourcés (URLs + nature de la preuve MRR) et une vérification active de la concurrence FR. Synthèse, scoring pondéré et décision par l'agent principal, **contre-vérification directe** sur le favori.

### Candidats évalués (détail complet dans `RESEARCH.md`)
- **Témoignages clients (Senja/Testimonial.to/Famewall)** → **62/70 (88,6 %)** ✅ **RETENU**
- Form builder (Tally) → 52/70 (74 %)
- Feedback board (Canny) → ~46/70 (66 %), faisabilité 2/5
- Affiliation SaaS (Rewardful/FirstPromoter) → 40/70 (57 %), concurrence FR réelle (Affilae, Track360)
- Help center Notion (HelpKit) → **éliminé** (dépendance API Notion restreinte ~3 req/s)
- Cluster email/tunnels/landing/scheduling → **éliminé** (incumbents FR : Brevo, Systeme.io ; mur OAuth)

### Décision (autonome)
**Produit retenu : « Preuvio »** — plateforme **FR-native** de collecte & affichage de témoignages clients (texte + vidéo) pour créateurs, freelances, coachs et fondateurs de SaaS francophones.

**Pourquoi** : preuve MRR la plus solide du panel (Senja 1M$ ARR, 1re main, nov. 2025 ; Famewall = preuve solo) ; **aucun équivalent FR** sur le segment créateur (confirmé par contre-vérification : les acteurs FR — Skeepers, Avis Vérifiés — ciblent l'e-commerce/marque) ; faisabilité 4/5 (pas d'effet réseau, pas d'API restreinte, pas de réglementation lourde) ; WTP prouvée ; angle différenciant net (français + RGPD + tarif €).

**Risque principal assumé** : la distribution (inhérente au créneau), mitigée par l'angle FR-natif. Pré-mortem : aucun risque rédhibitoire non mitigeable.

### Décision technique liée
- Stack par défaut conservée. **Adaptation** : Next.js **16** (au lieu de 15) car `create-next-app@latest` installe la dernière majeure stable (juin 2026) ; App Router identique, 100 % compatible Vercel. Justifié dans `STATE.md`.

**Prochaine étape** : Phase 2 — `PLAN.md` (spécification, schéma de données, architecture, parcours, wireframes).

---

## Phase 2 — Spécification & Plan ✅ (2026-06-23)

`PLAN.md` rédigé : proposition de valeur, **user stories MoSCoW** (7 Must, 7 Should, 4 Could, 7 Won't), périmètre explicite anti-scope-creep, **schéma de données** (profiles/spaces/testimonials/widgets + RLS + index), architecture des routes & composants, parcours utilisateur complet, flux auth + paiement, wireframes ASCII des 5 écrans clés, ordre de construction.

**4 fonctionnalités cœur abouties** : (1) espaces de collecte + page publique, (2) boîte de réception / modération, (3) widget « Mur de témoignages » embeddable + page hébergée, (4) facturation Stripe Free/Pro avec gating serveur.

**Prochaine étape** : Phase 3 — développement (parcours critique d'abord : socle → auth → espaces → collecte → modération → widget → Stripe).

---

## Phase 3 — Développement ✅ (2026-06-23)

- **Socle** : Next.js 16 + Tailwind v4 + shadcn/ui (19 primitives écrites à la main — registre réseau bloqué), clients Supabase (browser/server/admin/proxy) typés, client Stripe lazy, env validé (Zod), `plans.ts`, rate-limiter.
- **Base** : migration SQL unique (`0001_init.sql`) — tables, **RLS**, trigger d'inscription, `stripe_events`, bucket Storage.
- **Parcours critique** codé de bout en bout : auth (email/mot de passe) → espaces → page de collecte publique → boîte de réception → widget/embed → mur public → facturation Stripe (Checkout + webhook + portal).
- **Enrichissements** : vidéo (Pro), ajout manuel (Pro), perso widget, recherche/filtres, notif email (Resend, dégradation gracieuse), QR de partage.
- **Qualité** : TS strict, validation Zod serveur, états loading/error/empty, responsive + a11y, commits atomiques.
- **Revue** : `/code-review` (max) + `/security-review` exécutés. Tous les problèmes **critiques et majeurs corrigés** — détail dans `TEST_REPORT.md`. Notamment : **escalade de plan (profiles RLS)**, fuite cross-tenant, open-redirect, idempotence webhook, durcissement upload, rate-limiting, headers de sécurité.

## Phase 4 — Tests & QA ✅ (2026-06-23)

- **38 tests Vitest** sur la logique métier (slug, plans, validations) — verts.
- **Escouade de 10 angles d'agents** (4 code-review, 2 security, 4 QA : happy-path/user-stories, cas limites/erreurs, UX/a11y/copie, responsive/perf/Stripe).
- Consolidation dans `TEST_REPORT.md` par sévérité avec disposition (corriger/améliorer/modifier/supprimer) + statut.
- **Aucun blocage fonctionnel** ; tous les correctifs critiques/majeurs/mineurs impactants appliqués et re-vérifiés (build + typecheck + lint + tests verts).

## Phase 5 — Polish & pré-déploiement ✅ (2026-06-23)

- Boundaries `not-found` / `error` / `loading` (globales + dashboard + embed).
- A11y : RatingInput clavier, `aria-pressed` sur les toggles, contraste couleur de marque (`readableTextColor`), validation native réactivée.
- UX : sync du plan après Checkout Stripe, menu mobile marketing, messages d'erreur de connexion.
- SEO : métadonnées + Open Graph (root layout), `robots.ts`, `sitemap.ts`, favicon. Landing soignée (preuve sociale clairement marquée « exemple »).

## Phase 6 — Déploiement ✅ (2026-06-23)

- `DEPLOY.md` : procédure complète Vercel + Supabase (migration) + Stripe (webhook prod), variables d'env, checklist post-déploiement, commandes exactes, recommandations prod (rate-limit durable, leaked-password, etc.).
- `README.md`, `.env.example`, script `db:seed` : projet **directement déployable**, build vert.
- Branche poussée + **PR draft #1** ouverte (base `baseline`).

## Décisions notables consignées

- Stack : Next 16 (au lieu de 15) — dernière majeure stable, justifié dans `STATE.md`.
- shadcn écrit à la main (registre `ui.shadcn.com` renvoie 401 dans l'environnement).
- Lectures publiques via client service-role server-side (et non RLS anon) pour éliminer toute fuite cross-tenant.
- `force-dynamic` sur `/embed` et `/mur` : fraîcheur > cache (optimisation ISR documentée comme amélioration future).
- Rate-limiter en mémoire pour le MVP ; recommandation prod (KV durable) documentée.
