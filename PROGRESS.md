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

## Phase 2 — Spécification & Plan ⏳ (en cours)

_(Section mise à jour à la fin de la Phase 2.)_
