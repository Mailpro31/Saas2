# TEST_REPORT.md — Phase 4 : Tests & Assurance Qualité

> Synthèse consolidée des revues automatisées (code-review max, security-review)
> et de l'escouade d'agents QA. Chaque item : **constat → sévérité → disposition
> (à corriger / à améliorer / à modifier / à supprimer) → statut**.

## Méthodologie

- **Tests automatisés** : 38 tests Vitest sur la logique métier (slug, plans, validations Zod). ✅ tous verts.
- **Build / qualité** : `next build` ✅, `tsc --noEmit` strict ✅, ESLint ✅ — zéro erreur, zéro warning bloquant.
- **Revues par agents** (10 angles) :
  - `code-review` effort max : 4 agents (diff line-by-line, removed-behavior, cross-file, langage/framework, wrapper).
  - `security-review` : 2 agents (authz/RLS/multi-tenant ; injection/upload/SSRF/secrets/CSRF/headers/Stripe).
  - escouade QA : 4 agents (happy-path & user stories ; cas limites & états d'erreur ; UX & accessibilité & copie ; responsive & perf & Stripe).

---

## 🔴 Critique (corrigé)

| # | Constat | Disposition | Statut |
|---|---|---|---|
| C1 | **Escalade de plan** : la policy `profiles_update_own` permettait à un utilisateur de `PATCH` sa propre colonne `plan` via PostgREST et de se passer Pro gratuitement. | à corriger | ✅ Policy d'UPDATE supprimée + `revoke insert,update,delete on profiles from anon, authenticated`. La seule écriture légitime (`stripe_customer_id`) passe désormais par le client service-role. |

## 🟠 Majeur (corrigé)

| # | Constat | Disposition | Statut |
|---|---|---|---|
| M1 | **Fuite cross-tenant** : `spaces_select_public`/`testimonials_select_approved`/`widgets_select_public` (anon `using(true/status)`) exposaient toutes les données — dont les **emails** des auteurs — via l'API publique. | à corriger | ✅ Policies anon supprimées ; les pages publiques lisent server-side via le client service-role (jamais exposé au navigateur). |
| M2 | **Open redirect** dans `/auth/callback` (param `next` non validé). | à corriger | ✅ `next` restreint aux chemins relatifs same-origin. |
| M3 | **Webhook Stripe sans idempotence** (rejeu possible). | à corriger | ✅ Table `stripe_events` + dédup `event.id` (ack si déjà vu). |
| M4 | **Upload** : MIME basé sur `file.type` (spoofable) ; endpoint anonyme non lié à un espace. | à corriger | ✅ Validation **magic-bytes**, liaison à un `spaceId` existant, chemin namespacé, rate-limit. |
| M5 | **DoS** : flood de la file de témoignages / uploads sur endpoints anonymes. | à corriger | ✅ Rate-limiting best-effort par IP (8/min soumission, 15/min upload) + honeypot. ⚠️ Voir D1. |
| M6 | **États manquants** : aucun `loading.tsx` / `error.tsx` / `not-found.tsx`. | à ajouter | ✅ 404 + error boundary globaux, `loading` dashboard, boundaries minimales pour `/embed`. |
| M7 | **UX Stripe** : le plan affichait « Gratuit » après le retour de Checkout jusqu'au webhook. | à améliorer | ✅ Composant client qui re-synchronise la page après le retour `?success=1`. |
| M8 | **Robustesse webhook** : matching profil par `stripe_customer_id` seul (race possible). | à corriger | ✅ Repli sur `supabase_user_id` (métadonnée) + persistance du customer id. |

## 🟡 Mineur (corrigé)

| # | Constat | Disposition | Statut |
|---|---|---|---|
| m1 | `RatingInput` non navigable au clavier (radiogroup incomplet). | à corriger | ✅ Roving tabindex + flèches/Home/End + focus = survol. |
| m2 | État sélectionné des toggles (mode collecte, filtres, layout/colonnes/thème) invisible pour les lecteurs d'écran. | à corriger | ✅ `aria-pressed` ajouté partout. |
| m3 | Couleur de marque claire → texte blanc illisible (CTA, pastilles). | à améliorer | ✅ Util `readableTextColor` (luminance) sur le CTA et les pastilles publiques. |
| m4 | `getSession` utilisait `.single()` (throw si profil absent). | à corriger | ✅ `.maybeSingle()` + auto-réparation du profil via service-role. |
| m5 | Validation native désactivée (`noValidate`) sans feedback par champ. | à améliorer | ✅ `noValidate` retiré (indices natifs) sur collecte + auth. |
| m6 | `/auth/callback` échoué renvoyait `?error=callback` jamais affiché. | à améliorer | ✅ Alerte « lien expiré » sur la page de connexion. |
| m7 | Énumération de comptes à l'inscription (« un compte existe déjà »). | à améliorer | ✅ Réponse identique à une inscription normale. |
| m8 | Nav marketing (Tarifs/Fonctionnalités) cachée sur mobile. | à améliorer | ✅ Menu mobile ajouté. |
| m9 | `setTimeout` du bouton « Copier » non nettoyé ; clés d'index dans le mur ; resize embed avant chargement des médias ; désync d'état de plan (vidéo/branding). | à améliorer | ✅ Tous corrigés. |
| m10 | Ajout manuel : compteur non scopé à la propriété. | à améliorer | ✅ Vérification explicite de propriété ajoutée. |

## ⚪ Accepté / documenté (hors périmètre MVP)

| # | Constat | Disposition | Décision |
|---|---|---|---|
| D1 | Rate-limiter **en mémoire** (par instance, IP via `x-forwarded-for`). | à améliorer | 📋 Accepté pour le MVP. Recommandation prod (Upstash/Vercel KV + IP de confiance / WAF) documentée dans `DEPLOY.md`. |
| D2 | `force-dynamic` sur `/embed` et `/mur` (pas de cache CDN). | à améliorer | 📋 Choix assumé : fraîcheur des témoignages > cache. Optimisation ISR possible documentée. |
| D3 | Protection mot de passe (longueur min. 8 ; pas de check « leaked password »). | à améliorer | 📋 Activer « Leaked password protection » dans Supabase (documenté `DEPLOY.md`). |
| D4 | Bouton « Annuel » facture au mois si `STRIPE_PRICE_PRO_YEARLY` absent. | à améliorer | 📋 `.env.example` impose les deux price IDs ; documenté. |
| D5 | `muted-foreground` contraste AA limite (~4.6:1). | à améliorer | 📋 Conforme AA, conservé (valeur shadcn par défaut). |
| D6 | Pas de confirmation stylée (window.confirm) pour les suppressions. | à améliorer | 📋 Fonctionnel et accessible ; Dialog de confirmation = amélioration future. |

---

## Tests fonctionnels par user story (happy-path)

Les 7 user stories **Must** ont été tracées de bout en bout (UI → server action → DB → revalidation) : inscription/connexion ✅, création d'espace + widget par défaut ✅, soumission publique ✅, modération ✅, widget + embed + mur public ✅, facturation Stripe (Checkout + webhook idempotent + portal) ✅. **Aucun blocage fonctionnel.**

## Conclusion

Tous les problèmes **critiques et majeurs** sont corrigés et re-vérifiés (build + typecheck + lint + 38 tests verts). Les items restants sont des améliorations mineures explicitement acceptées pour le périmètre MVP, avec recommandations de production consignées dans `DEPLOY.md`.
