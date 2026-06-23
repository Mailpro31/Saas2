/goal Recherche, développement et validation autonome d'un SaaS prêt à déployer

# CONTEXTE & RÔLE

Tu agis comme un product engineer autonome. Ta mission complète : identifier une opportunité SaaS réelle, la valider, construire un MVP propre et poussé en fonctionnalités, le tester rigoureusement et le préparer au déploiement sur Vercel. Tu travailles de façon autonome SAUF aux points de validation explicitement marqués 🛑.

Avant de commencer, crée un fichier `PROGRESS.md` qui sert de journal de bord : à chaque phase terminée, tu y notes l'état, les décisions prises et les éventuels blocages. Mets-le à jour en continu.

---

# PHASE 0 — CADRAGE

Crée `STATE.md` avec la stack par défaut suivante (adapte si la Phase 1 révèle un meilleur choix, en justifiant) :
- Frontend/Backend : Next.js 15 (App Router) + TypeScript
- UI : Tailwind CSS + shadcn/ui
- Base de données : Supabase (PostgreSQL) ou Vercel Postgres
- Auth : Supabase Auth ou Auth.js
- Paiements : Stripe (mode test)
- Déploiement cible : Vercel
- Emails transactionnels : Resend (si pertinent)

---

# PHASE 1 — RECHERCHE (durée cible : 1h de recherche approfondie)

Effectue une recherche web exhaustive dans la niche des infopreneurs / entrepreneurs / créateurs pour identifier UNE opportunité répondant à TOUS ces critères :

- ✅ Besoin réel et documenté sur le marché français
- ✅ Déjà résolu par un SaaS aux États-Unis avec un MRR documenté ≈ 100k$ (preuve sourcée obligatoire : Indie Hackers, MicroConf, interviews, BuiltWith, communiqués, etc.)
- ✅ Pas (ou très peu) d'équivalent établi en France / Europe francophone
- ✅ Réalisable techniquement en MVP par une personne seule (pas d'infrastructure lourde type marketplace à double face avec masse critique)

**Méthode :**
- Explore plusieurs angles : SaaS directories (e.g. listes de SaaS rentables), communautés d'indie hackers, Reddit (r/SaaS, r/entrepreneur), Product Hunt, threads X/Twitter de founders qui partagent leur MRR
- Pour CHAQUE candidat, vérifie l'absence d'équivalent FR en cherchant activement les concurrents français
- Méfie-toi des chiffres de MRR invérifiables : si tu ne trouves pas de source crédible, signale-le explicitement plutôt que d'inventer

## GARDE-FOUS DE DÉCISION (à appliquer strictement)

**Critères d'élimination immédiate** — écarte tout candidat qui présente UN seul de ces signaux :
- MRR ≈ 100k$ sans aucune source vérifiable de première ou seconde main (auto-déclaration non corroborée = insuffisant)
- Un concurrent français déjà établi et financé existe sur le même problème
- Le MVP exige une masse critique d'utilisateurs pour avoir de la valeur (marketplace à double face, réseau social, effet de réseau fort)
- Le cœur du produit dépend d'un accès API/données coûteux, restreint, ou interdit aux nouveaux entrants
- Le besoin repose sur une mode passagère sans signal de demande durable
- Contraintes réglementaires lourdes en France (santé, finance régulée, données personnelles sensibles) impossibles à traiter dans un MVP

**Grille de scoring pondérée** — note chaque candidat survivant de 1 à 5 sur chaque critère, puis calcule un score total pondéré :

| Critère | Poids |
|---|---|
| Force de la preuve du MRR (source solide = 5) | ×3 |
| Réalité et intensité du besoin FR (signaux de demande concrets) | ×3 |
| Absence de concurrence FR sérieuse | ×2 |
| Faisabilité technique en MVP solo | ×2 |
| Willingness to pay claire (les gens paient déjà pour ce type d'outil) | ×2 |
| Taille du marché FR adressable | ×1 |
| Rapidité de mise sur le marché | ×1 |

**Règles de validation du choix :**
- Le candidat retenu doit avoir un score total ≥ 70% du maximum possible. Si AUCUN candidat n'atteint ce seuil, élargis la recherche à 3-4 nouveaux candidats avant de trancher — ne te rabats pas sur un mauvais choix par défaut.
- Le candidat retenu doit s'appuyer sur **au moins 2 sources indépendantes** corroborant le besoin (le SaaS US lui-même + une preuve de demande côté français : posts, recherches, plaintes d'utilisateurs, requêtes Google, communautés).
- Applique un **test de pré-mortem** : rédige le scénario « 6 mois après le lancement, ce produit a échoué — pourquoi ? ». Si la réponse révèle un risque rédhibitoire et non mitigeable, écarte le candidat.
- Vérifie activement que tu ne t'es pas trompé : pour le candidat favori, lance une dernière recherche ciblée « [nom du concept] + France/français » pour confirmer l'absence d'équivalent. Une concurrence FR découverte à ce stade disqualifie le candidat.

**Livrable Phase 1 :** un fichier `RESEARCH.md` contenant :
1. Un tableau comparatif de 4 à 5 candidats avec colonnes : Nom du SaaS US | MRR (avec source/lien) | Problème résolu | Besoin FR non couvert | Taille de marché FR estimée | Concurrence FR existante | Difficulté technique MVP (1-5) | Score pondéré total
2. La grille de scoring détaillée pour les 2-3 meilleurs candidats
3. Pour le candidat retenu : analyse approfondie (persona cible, willingness to pay, canaux d'acquisition, principal risque) + le pré-mortem + les 2+ sources corroborantes
4. **Ta décision finale argumentée** : choisis toi-même le meilleur candidat selon la grille et engage-toi dessus. N'attends aucune validation de ma part. Si le candidat n'atteint pas le seuil de 70%, explique pourquoi tu élargis la recherche. Consigne la décision et sa justification dans `PROGRESS.md`.

---

# PHASE 2 — SPÉCIFICATION & PLAN

Une fois l'idée retenue en Phase 1, produis `PLAN.md` :

- **Proposition de valeur** en une phrase
- **User stories** classées MoSCoW (Must / Should / Could / Won't-pour-le-MVP)
- **Périmètre explicite** : ce que le MVP fait ET ce qu'il ne fait PAS (anti-scope-creep)
- **Schéma de données** : tables, relations, contraintes
- **Architecture** : arborescence des routes, organisation des composants, API routes / server actions
- **Parcours utilisateur principal** décrit étape par étape (du landing à la valeur délivrée)
- **Flux d'authentification et de paiement**
- **Maquette textuelle** des écrans clés (wireframe en ASCII ou description structurée)

Va en profondeur : le but est une app **poussée en fonctionnalités sur le cœur du produit**, pas une démo creuse. Privilégie 3-4 fonctionnalités vraiment abouties plutôt que 15 superficielles.

---

# PHASE 3 — DÉVELOPPEMENT

Construis le MVP en suivant `PLAN.md`. Exigences de qualité :

- **TypeScript strict** (pas de `any` non justifié)
- **Variables d'environnement** : aucun secret en dur. Crée un `.env.example` documenté
- **Validation des entrées** côté serveur (Zod ou équivalent)
- **Gestion d'erreurs** propre (états loading / error / empty sur chaque écran)
- **Responsive** (mobile-first) et accessibilité de base (labels, contrastes, navigation clavier)
- **Seed data** : un script pour peupler la base avec des données de démo réalistes
- **Commits atomiques** avec messages clairs (convention type Conventional Commits)
- **README.md** au fil de l'eau : installation, variables d'env, lancement local, structure

Code d'abord le parcours critique de bout en bout (auth → fonctionnalité cœur → valeur délivrée), puis enrichis.

À la fin du codage, exécute dans l'ordre :
1. `/code-review ultra`
2. `/security-review ultra`

Corrige **tous** les problèmes critiques et majeurs remontés. Documente dans `PROGRESS.md` ce qui a été corrigé et ce qui a été volontairement écarté (avec raison).

---

# PHASE 4 — TESTS & ASSURANCE QUALITÉ

1. **Tests fonctionnels** : déroule chaque user story du PLAN, vérifie le résultat attendu, corrige les bugs.
2. **Tests automatisés** : écris au minimum des tests sur la logique métier critique et les fonctions utilitaires (Vitest/Jest). Vérifie que le build (`next build`) passe sans erreur ni warning bloquant.
3. **Escouade d'agents de test** : lance une dizaine d'agents spécialisés, chacun avec un angle distinct, par exemple :
   - Parcours utilisateur nominal (happy path)
   - Cas limites et entrées invalides (formulaires vides, valeurs extrêmes, caractères spéciaux)
   - Sécurité (injection, auth bypass, exposition de données, contrôle d'accès entre utilisateurs)
   - UX / clarté de l'interface et des messages
   - Performance et temps de chargement
   - Responsive / multi-device
   - Accessibilité
   - Gestion d'erreurs et états de chargement
   - Cohérence du flux de paiement Stripe (mode test)
   - Robustesse en cas d'échec réseau / API

   Chaque agent rédige un compte-rendu structuré (constat → sévérité → recommandation).

4. **Consolidation** : regroupe tous les retours dans `TEST_REPORT.md`, classés par sévérité, avec pour chacun une recommandation **à corriger / à améliorer / à modifier / à supprimer**.
5. **Application des correctifs** : implémente les corrections critiques et majeures. Re-teste après correction.

---

# PHASE 5 — POLISH & PRÉ-DÉPLOIEMENT

- Passe sur le design : cohérence visuelle, espacements, typographie, états vides soignés, micro-interactions si pertinent. L'app doit avoir l'air **finie**, pas prototypée.
- Vérifie le SEO de base (métadonnées, Open Graph, favicon, titre des pages)
- Ajoute une landing page convaincante si le produit en nécessite une (proposition de valeur, CTA, preuve sociale fictive clairement marquée si besoin)
- Optimisations : images, lazy loading, suppression du code mort

---

# PHASE 6 — DÉPLOIEMENT

Produis `DEPLOY.md` avec la procédure complète :
- Variables d'environnement à configurer sur Vercel
- Étapes de connexion du repo et de la base de données
- Configuration du webhook Stripe en production
- Checklist de vérification post-déploiement
- Commandes exactes (`vercel`, migrations DB, etc.)

Assure-toi que le projet est dans un état **directement déployable** : build vert, `.env.example` complet, aucune dépendance manquante.

---

# LIVRABLES ATTENDUS (récapitulatif)

| Fichier | Contenu |
|---|---|
| `RESEARCH.md` | Analyse des candidats + recommandation |
| `PLAN.md` | Spécification et architecture du MVP |
| `STATE.md` | Stack technique retenue |
| `PROGRESS.md` | Journal de bord continu |
| `TEST_REPORT.md` | Synthèse des tests et correctifs |
| `DEPLOY.md` | Procédure de déploiement Vercel |
| `README.md` | Documentation du projet |
| `.env.example` | Variables d'environnement documentées |
| Code source | MVP complet, testé, déployable |

---

# CONTRAINTES TRANSVERSES

- **Gestion du contexte** : exécute `/compact` dès que le contexte dépasse 40% de la fenêtre (≈ 400k tokens sur 1M).
- **Autonomie totale** : n'attends aucune validation humaine à aucune étape. Prends toutes les décisions toi-même (choix de l'idée, de la stack, des arbitrages produit) et exécute l'ensemble du pipeline de bout en bout sans t'arrêter.
- **Honnêteté > complaisance** : si une idée est faible, si un MRR est invérifiable, ou si une fonctionnalité dépasse le périmètre d'un MVP, dis-le clairement plutôt que de forcer.
- **Pas de secrets en dur, pas de données réelles sensibles, pas de code malveillant.**
- **Si tu es bloqué** sur une décision structurante non couverte ici, note l'option choisie et sa justification dans `PROGRESS.md` et continue.
