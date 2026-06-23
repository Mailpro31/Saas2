# STATE.md — Stack technique retenue

> Ce fichier fige la stack du projet. Toute déviation par rapport à la stack par défaut du `BRIEF.md` est justifiée ci-dessous.

## Stack par défaut (Phase 0)

| Couche | Choix | Justification |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | SSR/SSG, server actions, déploiement Vercel natif. |
| Langage | **TypeScript (strict)** | Sécurité de typage, exigence du brief. |
| UI | **Tailwind CSS v4 + shadcn/ui** | Composants accessibles, rapidité, cohérence visuelle. |
| Base de données | **Supabase (PostgreSQL)** | Postgres managé, RLS, free tier, intégration simple. |
| Auth | **Supabase Auth** | Intégré à la DB, magic link + email/password, RLS native. |
| ORM / accès DB | **Supabase JS client + SQL migrations** | Pas d'ORM lourd ; migrations SQL versionnées. |
| Validation | **Zod** | Validation côté serveur des entrées. |
| Paiements | **Stripe (mode test)** | Standard de facto, Checkout + webhooks + Customer Portal. |
| Emails | **Resend** | Emails transactionnels (notifications), si pertinent. |
| Déploiement | **Vercel** | Cible imposée. |
| Tests | **Vitest** | Tests unitaires de la logique métier. |

## Décisions d'adaptation (post-Phase 1)

_(À compléter après le choix du produit en Phase 1 si une adaptation est nécessaire.)_

- **Statut** : stack par défaut conservée. Voir `RESEARCH.md` pour le produit retenu et `PLAN.md` pour l'architecture détaillée.

## Principes transverses

- Aucun secret en dur — tout via variables d'environnement (`.env.example` documenté).
- Validation serveur systématique (Zod) sur toute entrée utilisateur.
- RLS Postgres activée pour l'isolation des données entre comptes.
- Mobile-first + accessibilité de base (labels, contrastes, navigation clavier).
