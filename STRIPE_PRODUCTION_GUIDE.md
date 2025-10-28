# 🚀 Guide de Passage en Production - Stripe

Ce guide vous explique comment passer de Stripe en mode **test** à **production** pour votre application Woodpecker Beats.

---

## 📋 **Vue d'Ensemble**

Actuellement, vous utilisez :
- ✅ **Mode Test Stripe** (`sk_test_...` et `pk_test_...`)
- ✅ **Webhook local** avec Stripe CLI (command: `stripe listen --forward-to localhost:3000/api/stripe/webhook`)

Pour passer en production, vous devrez :
1. Obtenir les clés de production Stripe
2. Configurer le webhook en production
3. Mettre à jour les variables d'environnement
4. Tester le flow complet

---

## 🔑 **Étape 1 : Obtenir les Clés de Production Stripe**

### 1.1 Activer le Mode Live dans Stripe

1. Allez sur [Stripe Dashboard](https://dashboard.stripe.com)
2. Cliquez sur le toggle **"Test mode"** (en haut à droite) pour l'activer en **"Live mode"**
3. Vous devrez peut-être compléter la vérification de votre compte (profil, email, etc.)

### 1.2 Récupérer les Clés de Production

1. Allez dans **Developers** → **API keys**
2. Vous verrez maintenant deux sections :
   - **Test mode keys** (actuellement utilisées)
   - **Live mode keys** (nouvelles clés de production)
3. Copiez les clés **Live mode** :
   - `STRIPE_SECRET_KEY` : commence par `sk_live_...`
   - `STRIPE_PUBLISHABLE_KEY` : commence par `pk_live_...`

**⚠️ IMPORTANT** : Les clés de production sont sensibles ! Ne les commitez JAMAIS dans Git.

---

## 🔗 **Étape 2 : Configurer le Webhook en Production**

### Option A : Webhook en Production (RECOMMANDÉ)

Le webhook local avec `stripe listen` est uniquement pour le développement. En production, Stripe appellera directement votre API.

#### 2.1 Configuration du Webhook Stripe

1. Dans Stripe Dashboard (en **Live mode**), allez dans **Developers** → **Webhooks**
2. Cliquez sur **"Add endpoint"**
3. Configurez le webhook :
   - **Endpoint URL** : `https://votre-domaine.com/api/stripe/webhook`
     - Exemple : `https://woodpeckerbeats.com/api/stripe/webhook`
   - **Description** : "Woodpecker Beats Payment Webhook"
   - **Events to send** : Sélectionnez ces événements :
     - `checkout.session.completed` ✅
     - `checkout.session.expired` ✅
     - `payment_intent.succeeded` ✅
     - `payment_intent.payment_failed` ✅
     - `charge.dispute.created` ✅
     - `charge.refunded` ✅
4. Cliquez sur **"Add endpoint"**
5. **Copiez le "Signing secret"** : commence par `whsec_live_...` (différent du test `whsec_test_...`)

#### 2.2 Mise à Jour des Variables d'Environnement

Créez un fichier `.env.production` ou utilisez les variables de votre plateforme de déploiement (Vercel, Railway, etc.) :

```bash
# Stripe Production
STRIPE_SECRET_KEY=sk_live_votre_clé_secrète_production
STRIPE_PUBLISHABLE_KEY=pk_live_votre_clé_publique_production
STRIPE_WEBHOOK_SECRET=whsec_live_votre_signing_secret_production

# NextAuth (production)
NEXTAUTH_URL=https://votre-domaine.com
NEXTAUTH_SECRET=votre-secret-ancien-fonctionne

# Autres variables...
DATABASE_URL=postgresql://...
CLOUDINARY_CLOUD_NAME=...
# etc.
```

---

## 🧪 **Étape 3 : Tester le Flow de Production**

### 3.1 Test avec des Cartes Réelles (Sous 2€)

Stripe propose un système de test avec des vrais paiements :

1. Dans Stripe Dashboard, allez dans **Settings** → **Payment methods**
2. Activez les modes de test de paiement
3. Testez avec une vraie carte (moins de 2€)
4. Les montants seront **automatiquement remboursés** par Stripe pour les tests

### 3.2 Vérifier les Webhooks

1. Allez dans **Developers** → **Webhooks**
2. Cliquez sur votre endpoint de production
3. Vérifiez que les événements sont bien reçus dans l'onglet **"Events"**

---

## 🛠️ **Étape 4 : Développement Local avec Production**

Si vous voulez tester localement avec les clés de production :

### 4.1 Créer un Fichier `.env.local.production`

```bash
# Stripe Production (pour tests locaux uniquement)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...

NEXTAUTH_URL=http://localhost:3000
```

### 4.2 Démarrer le Webhook Stripe (Production)

```bash
# En production, le webhook est automatique via Stripe
# Mais pour tester localement :
stripe listen --forward-to localhost:3000/api/stripe/webhook \
  --api-key sk_live_...
```

**⚠️ ATTENTION** : Ne testez JAMAIS les clés de production avec de vrais paiements en local !

---

## 📊 **Étape 5 : Monitoring et Logs**

### 5.1 Logs Stripe

Dans Stripe Dashboard → **Logs**, vous pouvez voir :
- ✅ Les paiements réussis
- ❌ Les paiements échoués
- 🔔 Les webhooks reçus/envoyés
- 💳 Les événements de paiement

### 5.2 Monitoring de l'Application

Assurez-vous que votre application log correctement :

```typescript
// Dans src/app/api/stripe/webhook/route.ts
console.log('✅ Webhook event received:', event.type)
console.log('✅ Payment successful:', session.id)
```

---

## ⚙️ **Étape 6 : Configuration Avancée (Optionnel)**

### 6.1 Mode Test vs Production Automatique

Vous pouvez détecter automatiquement le mode :

```typescript
// src/lib/stripe.ts
const isProduction = process.env.NODE_ENV === 'production'

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: '2025-08-27.basil',
  }
)

// Utiliser différentes URLs de success/cancel selon l'environnement
export const getCheckoutUrls = () => ({
  successUrl: isProduction 
    ? 'https://votre-domaine.com/success'
    : 'http://localhost:3000/success',
  cancelUrl: isProduction
    ? 'https://votre-domaine.com/cart'
    : 'http://localhost:3000/cart'
})
```

### 6.2 Double Configuration (Test + Production)

Vous pouvez avoir les deux configurations et basculer selon l'environnement :

```bash
# .env.development (mode test)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# .env.production (mode live)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

---

## 🚨 **Étape 7 : Security Checklist**

Avant de passer en production, vérifiez :

- [ ] Toutes les clés de production sont dans `.env.production` (jamais dans Git)
- [ ] Le webhook Stripe est configuré avec le bon endpoint URL
- [ ] `STRIPE_WEBHOOK_SECRET` est correct et en mode live
- [ ] Les événements Stripe sont bien traités (`checkout.session.completed`, etc.)
- [ ] Les emails de confirmation fonctionnent
- [ ] La base de données de production est séparée de celle de test
- [ ] Les logs ne contiennent pas de clés sensibles
- [ ] HTTPS est activé sur tous les endpoints Stripe
- [ ] Rate limiting est configuré pour protéger le webhook

---

## 📝 **Checklist de Lancement**

Avant de lancer en production :

1. **✅ Obtenir les clés de production Stripe**
2. **✅ Configurer le webhook Stripe (endpoint URL de production)**
3. **✅ Mettre à jour les variables d'environnement**
4. **✅ Tester avec une vraie carte (< 2€, automatiquement remboursé)**
5. **✅ Vérifier que les webhooks sont reçus**
6. **✅ Vérifier que les emails de confirmation sont envoyés**
7. **✅ Monitorer les logs pour détecter les erreurs**
8. **✅ Communiquer avec les utilisateurs (changements, etc.)**

---

## 🔄 **Alternative : Garder le Webhook Local pour le Développement**

Si vous voulez continuer à développer localement avec Stripe en mode test tout en ayant la production en live :

### Configuration Recommandée :

```bash
# .env.local (développement local)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
NEXTAUTH_URL=http://localhost:3000

# Variables de production (Vercel, Railway, etc.)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
NEXTAUTH_URL=https://votre-domaine.com
```

**Le webhook local** (`stripe listen`) sera utilisé uniquement en développement local.

**Le webhook Stripe** sera utilisé automatiquement en production sur Vercel/Railway/etc.

---

## 🎯 **Résumé**

| Mode | Clés | Webhook | URL |
|------|------|---------|-----|
| **Test** (local) | `sk_test_...` | Stripe CLI (`stripe listen`) | `http://localhost:3000/api/stripe/webhook` |
| **Production** | `sk_live_...` | Stripe Dashboard | `https://votre-domaine.com/api/stripe/webhook` |

**Réponse à votre question** :
> "should i keep my webhook running or what is the alternative?"

**Réponse** : 
- **En développement local** : Oui, gardez `stripe listen` pour tester
- **En production** : Non, le webhook local n'est pas nécessaire. Stripe appellera directement votre API en production.
- **Alternative** : Utilisez le webhook Stripe configuré dans le Dashboard Stripe.

---

## 🆘 **Support**

Si vous avez des questions ou rencontrez des problèmes :
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)

---

**🎉 Vous êtes prêt pour la production !**
