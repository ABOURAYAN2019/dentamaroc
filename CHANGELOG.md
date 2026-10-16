# Changelog

Toutes les modifications notables de **DentaMaroc** sont documentées dans ce fichier.
Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [0.2.0] - 2026-10-16

### Ajouté (Added)
- **Odontogramme Anatomique Réaliste (`ToothSvg.tsx` & `toothGeometry.ts`)** :
  - Rendu vectoriel réaliste distinguant incisives centrales/latérales, canines, prémolaires (1 ou 2 racines) et molaires supérieures (3 racines) / inférieures (2 racines).
  - Double vue synchronisée par dent : vue vestibulaire (couronne émaillée avec reflet 3D, racines anatomiques, bande gingivale) + vue occlusale interactive à 5 faces.
  - Saisie directe par clic sur une face occlusale et grand aperçu en direct dans le panneau latéral.
  - Choix du matériau (Composite vs Amalgame, Céramique vs Métal/Or) avec rendu visuel dédié (vis d'implant en titane, canaux endodontiques par racine, bridge).
- **Configuration Centralisée & White-Labeling (`src/config/app.config.ts`)** :
  - Validation par schéma **Zod** de toutes les variables d'environnement (`VITE_APP_NAME`, `VITE_DEFAULT_CURRENCY`, `VITE_COUNTRY_DIAL_CODE`, `VITE_TIMEZONE`, `VITE_REGULATORY_AUTHORITY`, etc.).
  - Possibilité pour des tiers d'adapter l'application à un autre pays ou cabinet uniquement via `.env`.
- **Qualité & Open-Source** :
  - Composant global `ErrorBoundary` pour la résilience de l'interface clinique.
  - Découpage du bundle de production (`manualChunks` dans `vite.config.ts`).
  - Pipeline CI GitHub Actions (`.github/workflows/ci.yml`), `LICENSE` MIT, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md` et `docs/ARCHITECTURE.md`.

---

## [0.1.0] - 2026-10-14

### Ajouté (Added)
- **MVP Complet DentaMaroc** :
  - Authentification et matrice RBAC (`dentist`, `assistant`, `secretary`).
  - Gestion des dossiers patients 360°, alertes médicales et conformité CNDP (Loi 09-08, consentement horodaté, export JSON, journal d'audit).
  - Agenda jour/semaine avec détection de conflits et rappels WhatsApp (`wa.me`).
  - Catalogue d'actes en MAD, plans de traitement et génération de devis PDF.
  - Facturation, paiements échelonnés, dépenses et clôture de caisse journalière (Z de caisse PDF).
  - Ordonnances médicales et certificats d'arrêt de travail en PDF.
  - Internationalisation complète Français / Arabe avec support RTL dynamique.
  - Cloud Functions TypeScript (`setUserClaims`, `prepareDailyReminders`, `onPatientModified`) et règles Firestore/Storage.
