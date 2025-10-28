# Changelog - Woodpecker Next.js

## [1.2.0] - 2024-12-19

### 🎯 Fonctionnalités Majeures
- **Système de téléchargement sécurisé AWS S3** : Implémentation complète du stockage et téléchargement sécurisé des fichiers audio
- **Support des licences mixtes** : Possibilité d'avoir différents types de licence par beat dans une commande multi-items
- **URLs signées S3** : Génération d'URLs temporaires sécurisées pour les téléchargements (expiration 30 minutes)

### 🔧 Améliorations Techniques

#### Base de Données (Prisma)
- **Migration OrderItem** : Ajout du champ `licenseType` avec valeur par défaut `WAV_LEASE`
- **Migration MultiItemOrder** : Suppression du champ `licenseType` (maintenant géré par OrderItem)
- **Support des licences par item** : Chaque OrderItem peut avoir son propre type de licence

#### APIs de Téléchargement
- **`/api/download/beat/[beatId]`** : 
  - Support des commandes multi-items avec récupération du `licenseType` correct
  - Génération conditionnelle des URLs stems basée sur le type de licence
  - Logs de debug améliorés pour le troubleshooting
- **`/api/download/multi-order/[orderId]`** :
  - Génération d'URLs stems pour les licences `TRACKOUT_LEASE` et `UNLIMITED_LEASE`
  - Support des licences mixtes dans une même commande
  - Interface `DownloadUrls` étendue avec `stems?: string`

#### Flux de Commande Stripe
- **Création de commandes PENDING** : 
  - Single-item : Création avant redirection Stripe avec `order_id` dans metadata
  - Multi-item : Création avant redirection Stripe avec `order_id` dans metadata
- **Webhook Stripe amélioré** :
  - Détection intelligente des commandes multi-items : `lineItems.length > 1 || metadata.order_id`
  - Mise à jour des commandes PENDING existantes au lieu de création de fallback
  - Support des métadonnées `items` pour les commandes multi-items

#### Interface Utilisateur
- **Page de succès** : Affichage conditionnel du bouton "Télécharger les stems (ZIP)"
- **Traductions** : Ajout des traductions pour `downloadStems` en français et anglais
- **Support multi-items** : Affichage des boutons de téléchargement pour chaque beat avec ses licences respectives

### 🐛 Corrections de Bugs

#### Problèmes de Licence
- **Fix** : Les licences `UNLIMITED_LEASE` et `TRACKOUT_LEASE` affichent maintenant correctement le bouton stems
- **Fix** : Correction des comparaisons de `licenseType` (`TRACKOUT_LEASE` au lieu de `TRACKOUT`)
- **Fix** : Les commandes multi-items avec licences mixtes fonctionnent correctement

#### Problèmes de Webhook
- **Fix** : Le webhook trouve maintenant les commandes PENDING existantes via `order_id`
- **Fix** : Plus de création de commandes fallback avec `WAV_LEASE` par défaut
- **Fix** : Les métadonnées Stripe sont correctement parsées pour les commandes multi-items

#### Problèmes de Base de Données
- **Fix** : Résolution des erreurs de contrainte null sur `licenseType`
- **Fix** : Migration sécurisée avec `--accept-data-loss` pour les changements de schema
- **Fix** : Valeur par défaut `WAV_LEASE` pour faciliter la migration

### 📁 Nouveaux Fichiers
- `docs/aws-s3-implementation.md` : Documentation complète de l'implémentation AWS S3
- `CHANGELOG.md` : Ce fichier de changelog

### 🔄 Modifications de Fichiers Existants

#### `src/app/api/download/beat/[beatId]/route.ts`
- Ajout de logs de debug pour `licenseType` et données stems
- Correction des comparaisons de licence (`TRACKOUT_LEASE`, `UNLIMITED_LEASE`)
- Support amélioré des commandes multi-items

#### `src/app/api/download/multi-order/[orderId]/route.ts`
- Génération d'URLs stems pour les licences appropriées
- Interface `DownloadUrls` étendue avec `stems?: string`
- Logs de debug pour la génération des URLs stems

#### `src/app/api/stripe/create-checkout/route.ts`
- Création de commandes PENDING avant redirection Stripe
- Passage de `orderId` dans les métadonnées Stripe
- Logs de debug pour le processus de création

#### `src/app/api/stripe/create-multi-checkout/route.ts`
- Création de commandes PENDING MultiItemOrder avant redirection
- Passage de `orderId` dans les métadonnées Stripe
- Logs de debug pour les items reçus

#### `src/app/api/stripe/webhook/route.ts`
- Détection améliorée des commandes multi-items
- Mise à jour des commandes PENDING existantes
- Support des métadonnées `items` pour les licences individuelles
- Logs de debug étendus pour le troubleshooting

#### `src/lib/stripe.ts`
- Support du paramètre `orderId` dans les fonctions de création de session
- Inclusion de `order_id` dans les métadonnées Stripe

#### `src/app/success/page.tsx`
- Affichage conditionnel du bouton stems pour les commandes multi-items
- Interface `DownloadUrls` mise à jour avec `stems?: string`

#### `src/app/cart/page.tsx`
- Passage de `beatId` dans les items pour le checkout multi-items

#### `prisma/schema.prisma`
- Ajout de `licenseType` à `OrderItem` avec valeur par défaut
- Suppression de `licenseType` de `MultiItemOrder`

#### `src/lib/translations/fr.ts` et `src/lib/translations/en.ts`
- Ajout de la traduction `downloadStems`

### 🧪 Tests Effectués
- ✅ Commande single-item avec `WAV_LEASE` : Master WAV uniquement
- ✅ Commande single-item avec `TRACKOUT_LEASE` : Master WAV + stems ZIP
- ✅ Commande single-item avec `UNLIMITED_LEASE` : Master WAV + stems ZIP
- ✅ Commande multi-items avec licences mixtes : Chaque beat avec ses licences respectives
- ✅ Webhook Stripe : Mise à jour correcte des commandes PENDING
- ✅ Sécurité : Validation de l'email client et statut de commande
- ✅ Expiration des URLs : URLs signées S3 avec expiration 30 minutes

### 🚀 Déploiement
- Migration de base de données : `npx prisma db push --accept-data-loss`
- Variables d'environnement AWS S3 requises
- Configuration Stripe avec métadonnées étendues

### 📊 Impact
- **Sécurité** : URLs signées S3 au lieu d'URLs publiques
- **Flexibilité** : Support des licences mixtes dans les commandes multi-items
- **Fiabilité** : Élimination des commandes fallback avec mauvais type de licence
- **UX** : Affichage correct des boutons de téléchargement selon le type de licence

---

## [1.1.0] - 2024-12-18

### Fonctionnalités
- Système de panier multi-items
- Intégration Stripe Checkout
- Gestion des commandes et emails de confirmation

### Corrections
- Résolution des problèmes de session utilisateur
- Amélioration de la gestion des erreurs

---

## [1.0.0] - 2024-12-17

### Version Initiale
- Interface utilisateur de base
- Système d'authentification
- Upload et gestion des beats
- Intégration Stripe de base
