# Guide de Contribution (Contributing Guide)

Merci de votre intérêt pour **DentaMaroc** ! Ce projet open-source vise à offrir aux cabinets dentaires (au Maroc et à l'international) une plateforme moderne, rapide, sécurisée et conforme aux réglementations sur les données de santé.

---

## 1. Prérequis Techniques

- **Node.js** : `>= 18.0.0` (Node 20 LTS ou 22 recommandé)
- **npm** : `>= 9.0.0`
- **Java JDK** : `>= 11` *(optionnel, requis uniquement pour lancer la Firebase Emulator Suite localement)*

---

## 2. Installation Rapide en Développement

```bash
# 1. Cloner le dépôt
git clone <url-du-repo>
cd brave-turing

# 2. Installer les dépendances frontend et Cloud Functions
npm install
npm --prefix functions install

# 3. Initialiser les variables d'environnement
cp .env.example .env

# 4. Lancer le serveur de développement (Mode Démo prêt à l'emploi)
npm run dev
```

L'application démarre sur `http://localhost:3000` avec des données fictives réalistes et un commutateur de rôle en 1 clic (`Dentiste`, `Assistante`, `Secrétaire`).

---

## 3. Standards de Qualité & Bonnes Pratiques

### TypeScript Strict
- **Aucun `any`** : Toutes les entités métier sont typées dans [`src/types/index.ts`](./src/types/index.ts).
- Les options `strict: true`, `noUnusedLocals: true` et `noUnusedParameters: true` sont activées dans [`tsconfig.app.json`](./tsconfig.app.json).
- Toute variable d'environnement doit être déclarée et validée avec **Zod** dans [`src/config/app.config.ts`](./src/config/app.config.ts).

### Architecture Modulaire par Features
Chaque domaine fonctionnel est isolé dans `src/features/<domaine>/` :
- `auth/` : Contexte d'authentification, gardes RBAC (`AuthGuard`, `RoleGuard`), sélecteur de rôle.
- `odontogram/` : Géométrie anatomique pure (`toothGeometry.ts`), rendu vectoriel (`ToothSvg.tsx`) et vue clinique (`OdontogramView.tsx`).
- `patients/` : Recherche, dossier 360°, alertes médicales et conformité CNDP (`PatientCNDPView.tsx`).
- `agenda/` : Planning jour/semaine, détection de conflits et rappels WhatsApp.
- `treatments/` : Catalogue d'actes, plans de traitement et devis PDF.
- `billing/` : Facturation, règlements échelonnés, dépenses et clôture de caisse journalière (Z de caisse).
- `documents/` : Ordonnances et certificats médicaux PDF.
- `settings/` : Configuration du cabinet, utilisateurs et paramètres régionaux.

### Internationalisation (FR / AR) & Support RTL
- Utilisez les clés de traduction dans [`src/locales/fr/translation.json`](./src/locales/fr/translation.json) et [`src/locales/ar/translation.json`](./src/locales/ar/translation.json).
- Privilégiez les propriétés logiques Tailwind (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`) au lieu de `ml-*`/`mr-*` pour garantir un rendu RTL impeccable en arabe.
- **Exception clinique** : Le schéma dentaire FDI (`OdontogramView`) conserve `dir="ltr"` pour respecter la convention anatomique internationale (Droite patient à gauche de l'écran).

### Confidentialité Médicale
- **Ne commitez jamais de vraies données de patients** (noms, numéros de téléphone, CIN ou radiographies réelles). Utilisez exclusivement des données fictives dans `demoData.ts` et les tests.

---

## 4. Adapter le Projet pour un Autre Pays ou Cabinet Tiers

Vous pouvez adapter DentaMaroc sans modifier le code source, simplement via le fichier `.env` :

```env
VITE_APP_NAME="DentaClinique"
VITE_DEFAULT_CURRENCY="EUR"
VITE_DEFAULT_LOCALE="fr-FR"
VITE_COUNTRY_DIAL_CODE="33"
VITE_TIMEZONE="Europe/Paris"
VITE_DEFAULT_CITY="Paris"
VITE_REGULATORY_AUTHORITY="CNIL"
VITE_REGULATORY_LAW="RGPD"
```

---

## 5. Vérification Avant Pull Request

Avant d'ouvrir une Pull Request, exécutez la commande de validation complète :

```bash
npm run validate
```

Cette commande vérifie dans l'ordre :
1. `npm run typecheck` : Vérification TypeScript stricte sans émission.
2. `npm test` : Exécution de la suite de tests unitaires et composants avec Vitest.
3. `npm run build` : Build de production Vite + génération du Service Worker PWA.

### Convention de Commits
Nous utilisons la spécification **Conventional Commits** :
- `feat(odontogram): add ceramic vs gold crown visual distinction`
- `fix(agenda): prevent overlapping slots on same practitioner`
- `docs(readme): document third-party white-label env vars`
- `test(rbac): add secretary restriction unit tests`
