# Politique de Sécurité & Conformité des Données de Santé (SECURITY.md)

La sécurité des dossiers médicaux est au cœur de l'architecture de **DentaMaroc**. Ce document décrit les mécanismes de protection intégrés ainsi que la procédure de signalement de vulnérabilités.

---

## 1. Signalement d'une Vulnérabilité

Si vous découvrez une faille de sécurité (fuite de données inter-cabinets, contournement de règles Firestore/Storage, XSS, etc.) :

1. **Ne créez pas d'Issue publique sur GitHub.**
2. Envoyez un rapport détaillé aux mainteneurs du projet avec :
   - Les étapes de reproduction.
   - Les fichiers ou règles concernés (`firestore.rules`, `storage.rules`, `functions/`).
   - L'impact potentiel sur les données cliniques.
3. Nous accusons réception sous **48 heures** et publions un correctif prioritaire.

---

## 2. Architecture de Sécurité Multi-Tenant & RBAC

### Isolation par Cabinet (`clinicId`)
Toutes les collections métier sont cloisonnées sous `clinics/{clinicId}/...`. Les règles [`firestore.rules`](./firestore.rules) et [`storage.rules`](./storage.rules) vérifient systématiquement que le jeton d'authentification Firebase Auth contient le Custom Claim `request.auth.token.clinicId == clinicId`.

### Contrôle d'Accès par Rôle (RBAC)
Trois rôles sont appliqués à la fois côté interface (`RoleGuard`) et côté serveur (`firestore.rules` / `storage.rules`) :
- **`dentist` (Admin)** : Accès complet, seul habilité à supprimer un dossier patient ou modifier les paramètres du cabinet.
- **`assistant`** : Accès lecture/écriture au dossier clinique (antécédents, odontogramme, plans de traitement, documents), sans droit de suppression ni accès à la clôture de caisse.
- **`secretary`** : Accès restreint aux données administratives, à l'agenda et à la facturation/caisse. **Les données médicales sensibles (odontogramme, plans de traitement, ordonnances) lui sont refusées.**

### Journal d'Audit Immuable (`auditLogs`)
- Chaque création, modification ou suppression de dossier patient déclenche l'écriture d'une entrée horodatée dans `clinics/{clinicId}/auditLogs`.
- Dans [`firestore.rules`](./firestore.rules), la règle `allow update, delete: if false;` garantit l'immuabilité totale du journal d'audit face aux clients.

---

## 3. Conformité Réglementaire (Maroc Loi 09-08 / CNDP & RGPD)

Lors d'un déploiement en production avec de vrais patients :
1. **Déclaration CNDP / Transfert International** : Au Maroc, les données de santé sont des données sensibles soumises à la **Loi 09-08**. L'hébergement sur Google Cloud / Firebase (`europe-west9` - Paris) nécessite une autorisation préalable de transfert de données auprès de la **CNDP** avant la mise en production.
2. **Variables d'Environnement** : Ne commitez jamais votre fichier `.env` contenant de vraies clés de production. Activez **Firebase App Check** (reCAPTCHA Enterprise) pour bloquer tout trafic non issu de votre domaine officiel.
3. **Mode Démo** : En production, définissez obligatoirement :
   ```env
   VITE_DEMO_MODE="false"
   VITE_ENABLE_ROLE_SWITCHER="false"
   VITE_USE_EMULATORS="false"
   ```
