# 🦷 DentaMaroc — Plateforme Open-Source de Gestion de Cabinet Dentaire

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](./LICENSE)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-5.7%20Strict-blue.svg)](./tsconfig.app.json)
[![React: 18.3](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Functions-ffca28.svg)](./firebase.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

**DentaMaroc** est une solution SaaS médicale **open-source**, modulaire et entièrement configurable, conçue pour les cabinets dentaires (praticien solo ou cabinets de 1 à 3 praticiens). Pensée nativement pour le contexte marocain (**MAD**, **+212**, **Loi 09-08 / CNDP**, **Français & Arabe RTL**), elle peut être adaptée en quelques secondes à tout autre pays ou cabinet tiers grâce à sa configuration centralisée par variables d'environnement.

---

## 📚 Documentation du Projet

- 🏗️ [**Architecture Technique & Odontogramme SVG (`docs/ARCHITECTURE.md`)**](./docs/ARCHITECTURE.md)
- 🤝 [**Guide de Contribution (`CONTRIBUTING.md`)**](./CONTRIBUTING.md)
- 🔒 [**Politique de Sécurité & Conformité Santé (`SECURITY.md`)**](./SECURITY.md)
- 📝 [**Journal des Versions (`CHANGELOG.md`)**](./CHANGELOG.md)
- ⚖️ [**Licence MIT (`LICENSE`)**](./LICENSE)

---

## ⚡ Démarrage Rapide en 60 Secondes (Zero-Config Demo Mode)

Aucune clé Firebase n'est requise pour tester l'application localement : un jeu de données fictives complet et un commutateur de rôle en 1 clic (`Dentiste`, `Assistante`, `Secrétaire`) sont intégrés.

```bash
# 1. Cloner le dépôt et installer les dépendances
git clone <url-du-repo>
cd brave-turing
npm install

# 2. Copier la configuration par défaut (Optionnel)
cp .env.example .env

# 3. Lancer l'application en mode développement
npm run dev
```

Ouvrez `http://localhost:3000` dans votre navigateur.

---

## ✨ Fonctionnalités Principales

| Module | Fonctionnalités Clés |
| :--- | :--- |
| **1. Odontogramme SVG Anatomique** | Denture adulte (**32 dents**) et enfant (**20 dents**) en notation **FDI**. Rendu vectoriel réaliste (incisives, canines, prémolaires 1-2 racines, molaires 2-3 racines, bande gingivale, reflets d'émail) + **vue occlusale interactive à 5 faces**. Rendu distinct des matériaux (Composite, Amalgame, Couronne Céramique ou Or, Vis d'implant en titane, Endodontie par canal). |
| **2. Dossiers Patients 360° & CNDP** | Recherche instantanée par Nom, CIN ou Téléphone, filtres débiteurs, alertes médicales critiques (allergies, anticoagulants, HTA), consentement horodaté, journal d'audit immuable et export portable JSON. |
| **3. Agenda Tactile & Conflits** | Vues Jour et Semaine, multi-praticiens, suivi temps réel (*Planifié → En salle d'attente → Au fauteuil → Terminé*), **détection automatique de chevauchement d'horaires**, rappels WhatsApp 1-clic (`wa.me`). |
| **4. Actes, Plans & Devis PDF** | Catalogue bilingue d'actes dentaires éditable, plan de traitement par dent, barre de progression des soins et **génération de devis estimatif en PDF**. |
| **5. Facturation & Clôture de Caisse** | Factures d'honoraires, paiements échelonnés (Espèces, Carte TPE, Chèque, Virement), gestion des dépenses espèces et **Clôture Journalière de Caisse (Z de caisse en PDF)** avec calcul automatique d'écart. |
| **6. Ordonnances & Certificats PDF** | Prescriptions rapides avec catalogue de médicaments fréquents pré-dosés (antibiotiques, antalgiques, bains de bouche) et certificats médicaux d'arrêt de travail en PDF. |
| **7. Multilingue FR / AR (RTL) & PWA** | Bascule instantanée Français / Arabe avec mise en page **RTL** native (tout en conservant l'orientation anatomique universelle de l'odontogramme) et support **PWA** hors-ligne. |

---

## ⚙️ Configuration & White-Labeling pour des Tiers (`.env`)

Toute la configuration régionale, le nom de la clinique/plateforme et le cadre réglementaire sont validés par **Zod** dans [`src/config/app.config.ts`](./src/config/app.config.ts). Vous pouvez adapter **DentaMaroc** à n'importe quel pays ou clinique sans toucher au code :

| Variable `.env` | Défaut (Maroc) | Exemple (Tunisie) | Exemple (France / Europe) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_APP_NAME` | `DentaMaroc` | `DentaTunis` | `DentaCloud` | Nom de l'application |
| `VITE_DEFAULT_CURRENCY` | `MAD` | `TND` | `EUR` | Code devise affiché sur devis/factures |
| `VITE_DEFAULT_LOCALE` | `fr-MA` | `fr-TN` | `fr-FR` | Locale de formatage numérique (`Intl`) |
| `VITE_COUNTRY_DIAL_CODE` | `212` | `216` | `33` | Indicatif téléphonique international & WhatsApp |
| `VITE_TIMEZONE` | `Africa/Casablanca` | `Africa/Tunis` | `Europe/Paris` | Fuseau horaire de l'agenda |
| `VITE_DEFAULT_CITY` | `Casablanca` | `Tunis` | `Paris` | Ville par défaut des nouveaux dossiers |
| `VITE_REGULATORY_AUTHORITY` | `CNDP` | `INPDP` | `CNIL` | Autorité de protection des données |
| `VITE_REGULATORY_LAW` | `Loi 09-08` | `Loi 2004-63` | `RGPD` | Référence légale affichée sur les consentements |
| `VITE_ENABLE_ROLE_SWITCHER` | `true` | `false` | `false` | Affiche/masque le sélecteur rapide de rôle en barre haute |
| `VITE_FIREBASE_REGION` | `europe-west9` | `europe-west9` | `europe-west9` | Région Cloud Functions & Firestore |

---

## 🔐 Matrice RBAC (Rôles & Permissions)

Les permissions sont appliquées à la fois côté interface (`RoleGuard`) et côté serveur ([`firestore.rules`](./firestore.rules) & [`storage.rules`](./storage.rules)) :

| Ressource / Action | Dentiste (`dentist`) | Assistante (`assistant`) | Secrétaire (`secretary`) |
| :--- | :---: | :---: | :---: |
| **Paramètres du cabinet & Équipe** | CRUD | Lecture | Aucun accès |
| **Patients — Identité & Contact** | CRUD | CRUD | CRUD |
| **Patients — Antécédents & Allergies** | CRUD | CRUD | **Masqué** |
| **Odontogramme SVG & Plans de soins** | CRUD | CRUD | **Masqué** |
| **Ordonnances & Certificats PDF** | CRUD | Lecture / Impression | **Masqué** |
| **Agenda & Rappels WhatsApp** | CRUD | CRUD | CRUD |
| **Factures, Règlements & Caisse (Z)** | CRUD | Lecture seule | CRUD |
| **Export CNDP & Suppression Patient** | **Autorisé** | Refusé | Refusé |

---

## 🧪 Commandes de Développement, Tests & Qualité

```bash
# Lancer le serveur de développement Vite (HMR)
npm run dev

# Vérifier le typage TypeScript strict (sans émission)
npm run typecheck

# Exécuter la suite de tests unitaires et composants (Vitest + Testing Library)
npm test

# Compiler le bundle PWA de production (avec découpage en chunks optimisés)
npm run build

# Validation complète (typecheck + tests + build) — exécutée par la CI GitHub Actions
npm run validate

# Compiler les Cloud Functions TypeScript
npm run build:functions

# Démarrer la suite d'émulateurs Firebase (Auth, Firestore, Storage, Functions)
npm run emulators
```

---

## 🇲🇦 Conformité CNDP (Loi 09-08 — Maroc) & Mise en Production

1. **Hébergement Hors du Maroc** : La région Firebase recommandée est `europe-west9` (Paris, ~25-35 ms depuis le Maroc). Conformément aux articles 43 et suivants de la **Loi 09-08**, le transfert de données de santé vers un serveur situé hors du territoire marocain nécessite **une autorisation préalable de transfert auprès de la CNDP** et un avis juridique avant toute exploitation avec de vrais patients.
2. **Durcissement Production** : Avant de déployer sur Firebase (`npx firebase deploy`), désactivez le sélecteur de démo dans votre `.env` de production :
   ```env
   VITE_DEMO_MODE="false"
   VITE_ENABLE_ROLE_SWITCHER="false"
   VITE_USE_EMULATORS="false"
   ```

---

## 🗺️ Roadmap Communautaire (V1)

Les contributions de la communauté sont les bienvenues sur ces chantiers (voir [`CONTRIBUTING.md`](./CONTRIBUTING.md)) :
- [ ] **Tiers Payant & Mutuelles (AMO / CNSS / CNOPS)** : Génération automatique des feuilles de soins mutuelles et suivi des remboursements.
- [ ] **Gestion de Stock & Traçabilité Stérilisation** : Suivi des lots, dates de péremption des composites/anesthésiques et cycles d'autoclave.
- [ ] **Suivi Laboratoire de Prothèse** : Bons de commande numériques (teintes VITA, dates d'essayage, facturation prothésiste).
- [ ] **Portail Patient** : Prise de rendez-vous en ligne et partage sécurisé des devis/ordonnances.

---

## 📄 Licence

Distribué sous licence **MIT**. Voir le fichier [`LICENSE`](./LICENSE) pour plus d'informations.
