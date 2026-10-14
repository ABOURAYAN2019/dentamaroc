# 🦷 DentaMaroc — Plateforme SaaS de Gestion de Cabinet Dentaire (Maroc)

**DentaMaroc** est une application SaaS médicale tout-en-un, spécialement conçue pour les cabinets dentaires au Maroc (praticien solo ou cabinets de 1 à 3 praticiens). Elle est utilisable de manière fluide sur ordinateur et sur tablette au fauteuil.

---

## 📋 Table des Matières
- [1. Stack Technique](#1-stack-technique)
- [2. Spécificités Maroc & Conformité CNDP (Loi 09-08)](#2-spécificités-maroc--conformité-cndp-loi-09-08)
- [3. Périmètre MVP Réalisé](#3-périmètre-mvp-réalisé)
- [4. Matrice RBAC (Rôles & Permissions)](#4-matrice-rbac-rôles--permissions)
- [5. Installation & Démarrage Local](#5-installation--démarrage-local)
- [6. Tests & Validation](#6-tests--validation)
- [7. Déploiement Firebase en Production](#7-déploiement-firebase-en-production)
- [8. Roadmap V1 (Post-MVP)](#8-roadmap-v1-post-mvp)

---

## 1. Stack Technique

### Frontend
- **Framework** : React 18 + Vite + TypeScript (mode strict)
- **Styling & UI** : Tailwind CSS + composants inspirés de shadcn/ui (thème médical Teal `#0d9488`)
- **Routage** : React Router v6 avec gardes d'authentification (`AuthGuard`) et de permissions (`RoleGuard`)
- **State Management & Requêtes** : TanStack Query v5 + Context API
- **Formulaires & Schémas** : React Hook Form + Zod
- **Dates & Localisation** : `date-fns` (fuseau horaire `Africa/Casablanca`, format `JJ/MM/AAAA`)
- **Internationalisation & RTL** : `i18next` avec bascule instantanée Français / Arabe avec support natif RTL et polices Google Fonts (*Inter* pour le français, *Cairo* pour l'arabe)
- **Export PDF** : `jspdf` pour devis dentaires, factures acquittées, ordonnances et certificats médicaux
- **PWA & Offline** : `vite-plugin-pwa` + persistance IndexedDB Firestore pour la consultation hors ligne

### Backend & Cloud
- **Firebase Auth** : Authentification par email/mot de passe avec Custom Claims (`role`, `clinicId`)
- **Cloud Firestore** : Base de données NoSQL multi-tenant sous `clinics/{clinicId}/...` en région `europe-west9` (Paris)
- **Firebase Storage** : Stockage sécurisé des pièces jointes, radios panoramiques/rétro-alvéolaires et photos cliniques
- **Cloud Functions TypeScript** :
  - `setUserClaims` : Attribution sécurisée des rôles
  - `prepareDailyReminders` : Tâche planifiée Cloud Scheduler (tous les jours à 18h) pour préparer les rappels WhatsApp du lendemain
  - `onPatientModified` : Déclencheur d'audit immuable CNDP
- **Firebase Emulator Suite** : Auth (9099), Firestore (8080), Storage (9199), Functions (5001), UI (4000)

---

## 2. Spécificités Maroc & Conformité CNDP (Loi 09-08)

### 🇲🇦 Paramètres Régionaux Marocains
- **Monnaie** : Dirham Marocain (`MAD` / `DH`), formaté avec séparateur de milliers et centimes (ex: `1 250,00 MAD`).
- **Dates** : Format officiel marocain `JJ/MM/AAAA` (ex: `14/10/2026`).
- **Fuseau horaire** : `Africa/Casablanca` (UTC+1).
- **Téléphones** : Validation et formatage des numéros mobiles marocains `+212 6XX XX XX XX` ou format national `06 XX XX XX XX`.
- **Identifiants nationaux** : Intégration de la **CIN** (Carte d'Identité Nationale), de l'**ICE** (Identifiant Commun de l'Entreprise) et du **N° INPE / Ordre National des Médecins Dentistes**.

### 🔒 Conformité CNDP (Commission Nationale de contrôle de protection des Données à caractère Personnel)
1. **Consentement Éclairé Horodaté** : Chaque fiche patient consigne le consentement exprès du patient ou de son tuteur légal, horodaté et signé électroniquement lors de l'ouverture du dossier.
2. **Journal d'Audit Immuable** : Traçabilité complète de tout accès, lecture, modification ou suppression d'un dossier médical dans la sous-collection `auditLogs`. Les règles Firestore interdisent formellement la modification ou la suppression des logs par les clients.
3. **Droit à l'Effacement (Suppression Définitive)** : Réservé exclusivement au Chirurgien-Dentiste responsable légal.
4. **Droit à la Portabilité (Export)** : Bouton en 1-clic pour exporter l'intégralité du dossier d'un patient au format standard JSON.
5. **Hébergement Hors du Maroc (Avis Juridique & CNDP)** :
   > ⚠️ **IMPORTANT** : La base Firestore et le Storage sont provisionnés sur la région `europe-west9` (Paris, France), offrant une latence de 25 à 35 ms depuis le Maroc. Conformément aux dispositions de l'article 43 et suivants de la **loi 09-08**, le transfert de données de santé à caractère personnel vers un serveur situé à l'étranger nécessite **une autorisation préalable de transfert de la CNDP** avant toute mise en production avec des données de patients réels.

---

## 3. Périmètre MVP Réalisé

| Module | Fonctionnalités Clés |
| :--- | :--- |
| **1. Auth & Rôles** | Multi-cabinet (`clinicId`), Custom Claims, 3 rôles (Dentiste, Assistante, Secrétaire), commutateur de test rapide 1-clic. |
| **2. Patients** | Recherche instantanée par Nom, CIN ou Téléphone (+212), filtres débiteurs, questionnaire médical & alertes (allergies, cardiopathies, Sintrom), consentement CNDP, export JSON. |
| **3. Agenda & RDV** | Vues Jour et Semaine, multi-praticiens, statuts de RDV tactiles (Planifié, Arrivé, Fauteuil, Terminé), **détection automatique de conflit de créneau**, bouton WhatsApp direct (`wa.me`). |
| **4. Odontogramme SVG** | Denture adulte (32 dents) et enfant (20 dents) en notation **FDI**, rendu vectoriel des 5 faces par dent (occlusale, vestibulaire, linguale, mésiale, distale), 8 états pathologiques (carie, obturation, couronne, dévitalisée, implant, absente...). |
| **5. Actes & Devis** | Catalogue bilingue d'actes dentaires éditable en MAD, plan de traitement par dent, suivi d'avancement des séances, **génération de devis estimatif en PDF**. |
| **6. Facturation & Caisse** | Factures d'honoraires, paiements échelonnés (espèces, carte TPE CMI, chèque, virement), suivi du solde patient, **clôture de caisse journalière (Z de caisse PDF)**, gestion des dépenses espèces. |
| **7. Documents Médicaux** | Ordonnances dentaires avec catalogue de médicaments fréquents (antibiotiques, antalgiques, bains de bouche), certificats d'arrêt de travail, export PDF avec en-tête légal du cabinet. |
| **8. Rappels WhatsApp** | Liens direct WhatsApp Web avec message personnalisé pré-rempli, Cloud Function planifiée pour la liste du lendemain. |
| **9. Tableau de Bord** | KPI du jour (patients attendus, en salle d'attente, au fauteuil), CA mensuel (MAD), impayés, timeline interactive du jour. |
| **10. Paramètres & Équipe** | Profil du cabinet, gestion de l'équipe et des invitations, bascule instantanée Français / Arabe (RTL). |

---

## 4. Matrice RBAC (Rôles & Permissions)

```
+------------------------------------+----------+------------+------------+
| Ressource / Module                 | Dentiste | Assistante | Secrétaire |
+------------------------------------+----------+------------+------------+
| Configuration du Cabinet           |   CRUD   |  Lecture   |   Aucun    |
| Dossier Patient (Identité/Contact) |   CRUD   |    CRUD    |    CRUD    |
| Questionnaire Médical & Allergies  |   CRUD   |    CRUD    |   Masqué   |
| Odontogramme SVG Interactif        |   CRUD   |    CRUD    |   Masqué   |
| Plans de Traitement & Devis        |   CRUD   |    CRUD    |   Masqué   |
| Factures & Encaissements           |   CRUD   |  Lecture   |    CRUD    |
| Clôture de Caisse & Dépenses       |   CRUD   |   Aucun    |    CRUD    |
| Ordonnances & Certificats          |   CRUD   |  Lecture   |   Aucun    |
| Suppression Patient & Export CNDP  |   CRUD   |   Aucun    |   Aucun    |
+------------------------------------+----------+------------+------------+
```

---

## 5. Installation & Démarrage Local

### Prérequis
- Node.js version 18, 20 ou 22
- npm version 10+
- Java JRE/JDK 11+ (requis uniquement pour exécuter les émulateurs locaux Firebase)

### 1. Cloner et installer les dépendances
```bash
git clone <url-du-repo>
cd brave-turing

# Installer les dépendances du frontend
npm install

# Installer les dépendances des Cloud Functions
npm --prefix functions install
```

### 2. Configuration d'environnement
Copiez le fichier `.env.example` en `.env` :
```bash
cp .env.example .env
```
Par défaut, `VITE_USE_EMULATORS=true` permet de travailler sans connexion internet avec les émulateurs locaux.

### 3. Lancer l'Émulateur Suite Firebase (Optionnel pour dev local)
```bash
npm run emulators
```
L'interface de gestion Firebase sera accessible sur `http://localhost:4000`.

### 4. Lancer le Frontend Vite
```bash
npm run dev
```
L'application s'ouvrira sur `http://localhost:3000`.

---

## 6. Tests & Validation

La suite de tests automatisée vérifie :
- Le formatage monétaire en Dirhams marocains (MAD)
- La conformité des numéros de téléphone marocains (+212)
- Le calcul de l'âge des patients
- La détection de chevauchement de créneaux dans l'agenda
- L'intégrité du système dentaire international FDI (32 dents adultes, 20 temporaires)
- La matrice des permissions RBAC

Lancer les tests en unitaire :
```bash
npm test
```

Lancer la compilation TypeScript et le build Vite de production :
```bash
npm run build
```

---

## 7. Déploiement Firebase en Production

1. Connectez-vous à votre compte Firebase :
   ```bash
   npx firebase login
   ```
2. Associez votre projet Firebase configuré en région `europe-west9` :
   ```bash
   npx firebase use <VOTRE_PROJECT_ID>
   ```
3. Déployez les règles Firestore, Storage, les Cloud Functions et le Hosting :
   ```bash
   npx firebase deploy
   ```

---

## 8. Roadmap V1 (Post-MVP)

- [ ] **Tiers Payant AMO / CNOPS / CNSS** :
  - Génération de la feuille de soins normalisée marocaine.
  - Gestion du ticket modérateur et du recouvrement des mutuelles privées (Saham/Sanad, Wafa Assurance, RMA, AXA).
- [ ] **Gestion de Stock Dentaire** :
  - Suivi des consommables (composites, anesthésiques, digues, fraises).
  - Alertes automatiques de date de péremption et seuil de réapprovisionnement.
- [ ] **Module Laboratoire de Prothèse** :
  - Bons de commande numériques de prothèses (empreintes, teintes VITA, essayages d'armatures, dates d'essayage).
  - Facturation mensuelle et suivi des travaux en cours.
- [ ] **Portail Patient Sécurisé** :
  - Prise de rendez-vous en ligne avec confirmation SMS/WhatsApp.
  - Espace de consultation des devis et ordonnances.
- [ ] **Intelligence Artificielle d'Imagerie** :
  - Détection assistée des lésions carieuses sur radios panoramiques et rétro-alvéolaires.
