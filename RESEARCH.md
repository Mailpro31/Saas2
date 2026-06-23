# RESEARCH.md — Phase 1 : Recherche & sélection d'opportunité

> Objectif : identifier **une** opportunité SaaS répondant à TOUS les critères du `BRIEF.md` :
> besoin FR documenté · SaaS US à ~100k$ MRR sourcé · pas d'équivalent FR établi · réalisable en MVP solo.
> Méthode : fan-out de 4 agents de recherche (clusters distincts) + contre-vérification directe sur le favori.
> Date : 2026-06-23.

---

## 1. Tableau comparatif des candidats

> Légende **Faisabilité** : 5 = très facile pour un dev solo, 1 = très difficile.
> Légende **Preuve MRR** : 🟢 1re main (founder publie ses chiffres) · 🟡 2e main (estimation getLatka/analyste) · 🔴 non sourcé.

| # | Concept (réf. US) | MRR / revenu (source) | Problème résolu | Besoin FR non couvert | Marché FR | Concurrence FR | Faisab. MVP solo | **Score /70** |
|---|---|---|---|---|---|---|---|---|
| **1** | **Témoignages clients** — Senja, Testimonial.to, Famewall | 🟢 Senja **~83k$/mo (1M$ ARR)**, founder-reported nov. 2025 ; Famewall 5k$/mo (preuve solo) | Collecter + afficher des témoignages texte/vidéo (« Wall of Love » embeddable) | **Aucun outil FR créateur/SaaS** : Skeepers/Avis Vérifiés = e-commerce/marque uniquement | Créateurs, freelances, coachs, SaaS FR (moyen, en croissance) | **Aucune** sur le segment créateur (e-commerce ≠ cible) | **4/5** | **62 (88,6 %)** ✅ |
| **2** | **Form builder** — Tally, Youform | 🟢 Tally **~5M$ ARR** (blog fondateurs) ; Youform 18k$/mo | Formulaires no-code (alt. Typeform « trop cher ») | Form builder créateur simple + gratuit | Large (tout le monde) | **Partielle** : Drag'n Survey (sondage entreprise/RGPD), pas le créneau exact | 3/5 | 52 (74 %) |
| **3** | **Affiliation SaaS** — Rewardful, FirstPromoter, Tolt | 🟡 Rewardful **~2,8M$ rev. 2024** (getLatka) ; FirstPromoter exit 1-10M€ ARR (1re main indirecte) | Programme d'affiliation/parrainage branché Stripe | Onboarding indie-first FR (15 min) | Petit (SaaS qui font de l'affiliation) | **Réelle** : Affilae (2012), Track360 (FR) | 3/5 | 40 (57 %) ❌ |
| **4** | **Feedback board** — Canny, Featurebase, Upvoty | 🟢 Canny **~3,4M$ ARR** (blog, 2024) ; Featurebase 100k$ ARR | Board de feedback à votes + roadmap + changelog | Pas de combo FR-natif | Modéré (B2B SaaS FR) | Adjacents : Harvestr, Cycle (→ Atlassian), Kantree | 2/5 | ~46 (66 %) ❌ |
| **5** | **Help center Notion** — HelpKit | 🟢 **~10k$ MRR** (1re main, plafond 2023) | Transformer des docs Notion en centre d'aide hébergé | Centre d'aide simple FR | Modéré | Helpable (centre d'aide IA FR) | 3/5 | **Éliminé** ⛔ |

### Éliminations immédiates (garde-fous du brief)

- **#5 Help center HelpKit ⛔** — *dépendance à une API restreinte/non scalable* : l'API Notion plafonne à **~3 req/s non négociables** (impossible de payer pour augmenter), payloads limités, URLs de fichiers expirant en ~1h, **risque plateforme**. Critère d'élimination immédiate déclenché.
- **Cluster ops créateurs (email / tunnels / landing / cours / scheduling) ⛔** — *concurrents FR établis et financés* : **Brevo** (licorne, email) et **Systeme.io** (~20M$ ARR, all-in-one créateurs FR) couvrent déjà ces besoins gratuitement et en français. Scheduling = mur de vérification OAuth Google/Microsoft (faisabilité 1-2/5) + concurrents FR (Resaclick, Brevo Meetings).
- **#4 Feedback board** — non éliminé d'office mais **faisabilité 2/5** (build lourd : votes, dédup d'identité, workflow de statuts, modération) + effet de réseau local (chaque board ne vit que si les end-users votent) → score sous le seuil.
- **#3 Affiliation** — non éliminé d'office mais **concurrence FR réelle** (Affilae établi depuis 2012, Track360) + marché mondial mûr/encombré + preuve MRR surtout 2e main → score sous le seuil.

---

## 2. Grille de scoring détaillée (top 3)

> Pondérations du brief : Preuve MRR ×3 · Besoin FR ×3 · Absence concurrence FR ×2 · Faisabilité MVP solo ×2 · Willingness-to-pay ×2 · Taille marché FR ×1 · Time-to-market ×1.
> Note brute 1-5 par critère. **Max théorique = 5 × 14 = 70.** Seuil de validation = 70 % → **49/70**.

| Critère (poids) | **#1 Témoignages** | #2 Form builder | #3 Affiliation |
|---|---|---|---|
| Preuve MRR (×3) | 5 → **15** | 5 → 15 | 3 → 9 |
| Réalité besoin FR (×3) | 4 → **12** | 4 → 12 | 3 → 9 |
| Absence concurrence FR (×2) | 5 → **10** | 3 → 6 | 2 → 4 |
| Faisabilité MVP solo (×2) | 4 → **8** | 3 → 6 | 3 → 6 |
| Willingness-to-pay (×2) | 5 → **10** | 3 → 6 | 4 → 8 |
| Taille marché FR (×1) | 3 → **3** | 4 → 4 | 2 → 2 |
| Time-to-market (×1) | 4 → **4** | 3 → 3 | 2 → 2 |
| **TOTAL /70** | **62 (88,6 %)** ✅ | 52 (74 %) | 40 (57 %) ❌ |

**#1 Témoignages** domine sur les critères les plus pondérés (preuve MRR, absence de concurrence FR, WTP). **#2 Form builder** passe le seuil mais reste pénalisé par une concurrence FR partielle (Drag'n Survey) et une faisabilité moindre (un free tier illimité « à la Tally » impose une infra exigeante). **#3 Affiliation** échoue sous le seuil.

---

## 3. Analyse approfondie du candidat retenu — Témoignages clients (« Preuvio »)

**Proposition** : un SaaS **francophone** qui permet à un créateur de **collecter** des témoignages clients (texte + vidéo) via une page de collecte partageable et de les **afficher** partout via un widget « Mur de témoignages » embeddable + une page publique hébergée.

### Persona cible
- **Primaire** : infopreneur / coach / formateur / consultant FR vendant une offre (formation, accompagnement, prestation). Il a des clients satisfaits mais aucun moyen simple de transformer cette satisfaction en preuve sociale crédible sur sa page de vente.
- **Secondaire** : freelance (dev, designer, rédacteur) et **fondateur de micro-SaaS FR** qui veut un « Wall of Love » sur sa landing.
- Point commun : pas d'équipe technique, budget serré, sensibilité au français et au RGPD.

### Willingness-to-pay (WTP)
- **Prouvée** : les créateurs paient déjà Senja (29$/mo), Testimonial.to (à partir de ~60$/mo), Famewall, Vouch pour exactement ce besoin. Le marché monétise text **et** vidéo.
- Modèle FR cohérent : **Gratuit** (1 espace de collecte, jusqu'à X témoignages, widget avec marque « Propulsé par Preuvio ») → **Pro ~12-19€/mo** (espaces illimités, témoignages illimités, vidéo, retrait du branding, thèmes). La preuve sociale a un ROI direct (taux de conversion d'une page de vente) → élasticité-prix favorable.

### Canaux d'acquisition
1. **SEO français** : « widget témoignages site », « afficher avis clients site web », « alternative française à Testimonial.to » — demande captée aujourd'hui par des outils US.
2. **Boucle virale « Propulsé par Preuvio »** : chaque widget gratuit affiché = acquisition organique (le moteur de croissance de Senja/Testimonial.to).
3. **Communautés FR** : indiemakers.fr, groupes d'infopreneurs, Systeme.io/Podia (intégrations + contenu).
4. **Content marketing** : « comment demander un témoignage », templates de demande en français.

### Risque principal
**La distribution, pas la technique.** Le produit est techniquement réplicable (Famewall = preuve qu'un solo y arrive) ; le défi est l'acquisition dans un marché mondial encombré. **Mitigation = l'angle FR-natif** précisément là où aucun acteur FR n'existe : interface/support 100 % français, **conformité RGPD + hébergement UE** comme argument de confiance, intégrations avec l'écosystème créateur FR.

### Pré-mortem — « 6 mois après le lancement, c'est un échec. Pourquoi ? »
| Scénario d'échec | Probabilité | Mitigable ? |
|---|---|---|
| Personne ne découvre le produit (échec de distribution) | Élevée | ✅ Oui — SEO FR + boucle « powered by » + communautés ; risque inhérent à tout SaaS solo, non rédhibitoire |
| Les créateurs FR utilisent déjà Senja/Testimonial.to en anglais | Moyenne | ✅ Oui — différenciation par le français, le prix en €, le RGPD, les intégrations FR |
| Coût d'hébergement vidéo qui explose | Faible-moyenne | ✅ Oui — MVP text-first + vidéo plafonnée (upload Supabase Storage, pas de transcodage), vidéo en feature Pro |
| Un concurrent FR émerge en même temps | Faible | ✅ Oui — aucun détecté à ce jour (cf. §4) ; avantage du premier entrant FR |
| Réglementation bloquante | Très faible | ✅ Oui — témoignages = contenu soumis avec consentement explicite (case RGPD à la soumission) ; aucune donnée sensible |

**Verdict pré-mortem** : aucun risque **rédhibitoire et non mitigeable**. Le risque dominant (distribution) est réel mais c'est exactement celui que l'angle FR-natif adresse. ✅ Candidat conservé.

### Sources corroborantes (≥ 2 indépendantes, dont une preuve de demande FR)
1. **SaaS US + preuve MRR (1re main)** :
   - Senja — 1M$ ARR annoncé par le co-fondateur Olly Meakings : <https://x.com/helloitsolly/status/1922706651892809925> ; corroboré : <https://www.highsignal.io/senja-hits-1m-arr/>
   - Famewall (preuve qu'un dev solo atteint 5k$/mo) : <https://www.indiehackers.com/post/i-got-to-5-000-in-monthly-revenue-but-it-took-me-3-years-a-burnout-716475f6f8>
   - Testimonial.to (Damon Chen, ~800k$ ARR 2023) : <https://www.indiehackers.com/post/hit-100k-arr-after-9-months-grinding-as-a-solo-founder-ama-584379b1f6>
2. **Preuve de demande côté français** :
   - Comparatifs FR « outils pour collecter et afficher vos témoignages clients » citant Senja/Testimonial.to comme références (= demande FR captée par des outils US) : <https://www.codeur.com/blog/temoignages-clients/> · <https://buildmarketing.io/meilleurs-outils-davis-client/>
   - Contre-vérification (cf. §4) : aucune alternative **française** identifiée pour le segment créateur.

---

## 4. Contre-vérification finale du favori (« témoignages + France »)

Recherches directes menées par l'agent principal le 2026-06-23 :
- `logiciel français collecter témoignages clients widget mur d'avis site web SaaS`
- `alternative française Senja Testimonial.to outil témoignages vidéo créateurs`

**Résultat** : les seules solutions « françaises » retournées (Avis Vérifiés, Guest Suite, Trustt, eKomi, Skeepers, Société des Avis Garantis) sont des **plateformes d'avis e-commerce/marque** (tarifs ≥ 69€/mo, orientées boutiques en ligne), **pas** le widget « Wall of Love » pour créateur/SaaS. La seconde recherche conclut explicitement qu'**aucune alternative française** n'apparaît pour le segment créateur ; tous les outils de témoignages créateur cités sont US/internationaux (Senja, Testimonial.to, Famewall, Vocal Video, Vidlo, Trust, Endorsal).

➡️ **Absence de concurrence FR sur le segment créateur/SaaS = confirmée. Le candidat n'est pas disqualifié.**

---

## 5. Décision finale (autonome, sans validation humaine)

**Je retiens le candidat #1 : une plateforme FR-native de collecte & affichage de témoignages clients, nommée « Preuvio ».**

**Justification** :
- **Score 62/70 (88,6 %)**, très au-dessus du seuil de 70 %, et n°1 sur les 3 critères les plus pondérés (preuve MRR, absence de concurrence FR, WTP).
- **Preuve MRR la plus solide** du panel : Senja (1M$ ARR, 1re main, nov. 2025) + Famewall (preuve qu'un solo atteint 5k$/mo) + Testimonial.to.
- **Aucun équivalent FR** sur le segment créateur (confirmé par contre-vérification directe).
- **Faisabilité solo 4/5** : pas d'effet de réseau, pas d'API restreinte, pas de réglementation lourde, parcours technique standard (formulaire → stockage → widget embeddable → Stripe).
- **WTP prouvée** et **angle de différenciation clair** (FR + RGPD + €).

**Risque assumé** : la distribution (inhérente au créneau) — adressée par le positionnement FR-natif.

➡️ Enchaînement direct sur la **Phase 2 (PLAN.md)**. Décision consignée dans `PROGRESS.md`.
