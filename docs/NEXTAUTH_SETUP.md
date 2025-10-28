# 🔐 Configuration NextAuth - Woodpecker Beats

Ce guide vous explique comment configurer NextAuth.js avec les providers email, GitHub et Google pour votre application Woodpecker Beats.

## 📋 Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env.local` :

```bash
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/woodpecker_beats"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Prisma
PRISMA_STUDIO_PORT=5555

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"

# Email (pour NextAuth)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@woodpeckerbeats.com"

# OAuth Providers
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 🔑 Configuration des providers

### 1. NEXTAUTH_SECRET
Générez une clé secrète sécurisée :
```bash
openssl rand -base64 32
```

### 2. Provider Email
Pour utiliser l'authentification par email, configurez un serveur SMTP :

#### Gmail
1. Activez l'authentification à 2 facteurs sur votre compte Gmail
2. Générez un mot de passe d'application :
   - Allez dans Paramètres Google → Sécurité
   - Sélectionnez "Mots de passe des applications"
   - Générez un nouveau mot de passe pour "Mail"
3. Utilisez ces paramètres :
   ```
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=votre-email@gmail.com
   EMAIL_SERVER_PASSWORD=votre-mot-de-passe-application
   ```

#### Autres fournisseurs SMTP
- **Outlook/Hotmail** : `smtp-mail.outlook.com:587`
- **Yahoo** : `smtp.mail.yahoo.com:587`
- **SendGrid** : `smtp.sendgrid.net:587`

### 3. Provider GitHub
1. Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Cliquez sur "New OAuth App"
3. Remplissez les informations :
   - **Application name** : Woodpecker Beats
   - **Homepage URL** : `http://localhost:3000` (dev) ou votre domaine (prod)
   - **Authorization callback URL** : `http://localhost:3000/api/auth/callback/github`
4. Copiez le **Client ID** et **Client Secret**

### 4. Provider Google
1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ (ou Google Identity)
4. Allez dans "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configurez l'écran de consentement OAuth si nécessaire
6. Remplissez les informations :
   - **Application type** : Web application
   - **Authorized redirect URIs** : `http://localhost:3000/api/auth/callback/google`
7. Copiez le **Client ID** et **Client Secret**

## 🗄️ Base de données

Les modèles NextAuth ont été ajoutés au schéma Prisma :
- `User` - Informations utilisateur
- `Account` - Comptes OAuth liés
- `Session` - Sessions utilisateur
- `VerificationToken` - Tokens de vérification email

Exécutez la migration :
```bash
pnpm db:migrate
```

## 🚀 Utilisation

### Pages d'authentification
- **Connexion** : `/auth/signin`
- **Inscription** : `/auth/signup`
- **Erreur** : `/auth/error`

### Composants disponibles
- `AuthButton` - Bouton de connexion/déconnexion
- `ProtectedRoute` - Protection des routes
- `SessionProvider` - Provider de session

### Exemple d'utilisation
```tsx
import { useSession } from 'next-auth/react'
import ProtectedRoute from '@/components/ProtectedRoute'

function MyPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <p>Chargement...</p>
  if (status === 'unauthenticated') return <p>Non connecté</p>

  return (
    <ProtectedRoute>
      <p>Connecté en tant que {session?.user?.email}</p>
    </ProtectedRoute>
  )
}
```

## 🔧 Personnalisation

### Callbacks personnalisés
Modifiez `src/lib/auth.ts` pour ajouter des callbacks personnalisés :

```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    // Logique personnalisée de connexion
    return true
  },
  async redirect({ url, baseUrl }) {
    // Logique de redirection personnalisée
    return baseUrl
  },
  async session({ session, user }) {
    // Ajouter des données personnalisées à la session
    session.user.id = user.id
    return session
  }
}
```

### Pages personnalisées
Les pages d'authentification peuvent être personnalisées en modifiant les fichiers dans `src/app/auth/`.

## 🚨 Résolution des problèmes

### Erreur "Configuration"
- Vérifiez que `NEXTAUTH_SECRET` est défini
- Vérifiez que `NEXTAUTH_URL` correspond à votre domaine

### Erreur "AccessDenied"
- Vérifiez les URLs de callback OAuth
- Vérifiez les clés client OAuth

### Erreur "Verification"
- Vérifiez la configuration SMTP
- Vérifiez que `EMAIL_FROM` est défini

### Problèmes de base de données
- Vérifiez que la migration a été exécutée
- Vérifiez la connexion à la base de données

## 📞 Support

Pour plus d'informations :
- [Documentation NextAuth.js](https://next-auth.js.org)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation OAuth](https://oauth.net/2/)












