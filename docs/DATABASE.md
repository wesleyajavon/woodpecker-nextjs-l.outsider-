# 🗄️ Base de données Woodpecker Beats

Ce document décrit la configuration et l'utilisation de la base de données PostgreSQL avec Prisma pour la plateforme Woodpecker Beats.

## 🚀 **Configuration initiale**

### **1. Variables d'environnement**

Créez un fichier `.env` à la racine du projet avec :

```bash
# Base de données PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/woodpecker_beats?schema=public"

# Prisma
PRISMA_STUDIO_PORT=5555

# Next.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### **2. Formats de DATABASE_URL**

#### **Local PostgreSQL**
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/woodpecker_beats"
```

#### **Supabase**
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

#### **Railway**
```bash
DATABASE_URL="postgresql://postgresql:[YOUR-PASSWORD]@containers-us-west-[YOUR-REGION].railway.app:5432/railway"
```

#### **Neon**
```bash
DATABASE_URL="postgresql://[YOUR-USERNAME]:[YOUR-PASSWORD]@[YOUR-HOST]/[YOUR-DATABASE]?sslmode=require"
```

## 🗂️ **Modèles de données**

### **Beat Model**
```typescript
model Beat {
  id          String   @id @default(cuid())
  title       String
  description String?
  genre       String
  bpm         Int
  key         String
  duration    String
  // Pricing for different license types
  wavLeasePrice      Decimal  @db.Decimal(10, 2) @default(19.99)
  trackoutLeasePrice Decimal  @db.Decimal(10, 2) @default(39.99)
  unlimitedLeasePrice Decimal @db.Decimal(10, 2) @default(79.99)
  
  // Legacy pricing (deprecated)
  price       Decimal  @db.Decimal(10, 2)
  
  rating      Float    @default(0)
  reviewCount Int      @default(0)
  tags        String[]
  previewUrl  String?
  fullUrl     String?
  stemsUrl    String?  // ZIP file containing stems
  artworkUrl  String?  // Beat artwork image
  isExclusive Boolean  @default(false)
  isActive    Boolean  @default(true)
  featured    Boolean  @default(false)
  
  // Stripe integration
  stripePriceId String? // Deprecated
  
  // Stripe Price IDs for each license type
  stripeWavPriceId      String?
  stripeTrackoutPriceId String?
  stripeUnlimitedPriceId String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  orders      Order[]
}
```

### **Order Model**
```typescript
model Order {
  id            String      @id @default(cuid())
  customerEmail String
  customerName  String?
  customerPhone String?
  totalAmount   Decimal     @db.Decimal(10, 2)
  currency      String      @default("EUR")
  status        OrderStatus @default(PENDING)
  paymentMethod String?
  paymentId     String?
  paidAt        DateTime?
  licenseType   LicenseType @default(WAV_LEASE)
  usageRights   String[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  beatId        String
  beat          Beat        @relation(fields: [beatId], references: [id])
}
```

## 🛠️ **Commandes Prisma**

### **Génération du client**
```bash
npm run db:generate
# ou
npx prisma generate
```

### **Push de la base de données (développement)**
```bash
npm run db:push
# ou
npx prisma db push
```

### **Migration de la base de données**
```bash
npm run db:migrate
# ou
npx prisma migrate dev
```

### **Seed de la base de données**
```bash
npm run db:seed
# ou
npx prisma db seed
```

### **Ouvrir Prisma Studio**
```bash
npm run db:studio
# ou
npx prisma studio
```

## 🌱 **Données de test**

Le script de seed crée automatiquement :

- **8 beats** dans différents genres (Trap, Hip-Hop, Drill, Jazz, etc.)
- **2 commandes** d'exemple avec différents statuts
- **Tags** et métadonnées réalistes

## 📊 **Indexes de performance**

### **Beat Indexes**
- `genre` - Recherche par genre
- `bpm` - Filtrage par BPM
- `key` - Filtrage par tonalité
- `wavLeasePrice` - Tri et filtrage par prix WAV
- `trackoutLeasePrice` - Tri et filtrage par prix Trackout
- `unlimitedLeasePrice` - Tri et filtrage par prix Unlimited
- `rating` - Tri par note
- `isActive` - Filtrage des beats actifs
- `featured` - Filtrage des beats en vedette

### **Order Indexes**
- `customerEmail` - Recherche par client
- `status` - Filtrage par statut
- `createdAt` - Tri chronologique
- `beatId` - Relation avec les beats

## 🔒 **Sécurité et bonnes pratiques**

### **1. Validation des données**
- Tous les champs obligatoires sont validés
- Les prix utilisent le type `Decimal` pour la précision
- Les emails sont validés côté serveur

### **2. Gestion des erreurs**
- Gestion des erreurs de connexion
- Retry automatique en cas d'échec
- Logs détaillés en développement

### **3. Performance**
- Index sur les champs de recherche fréquents
- Pagination pour les grandes listes
- Requêtes optimisées avec Prisma

## 🚨 **Dépannage**

### **Erreur de connexion**
```bash
# Vérifiez votre DATABASE_URL
echo $DATABASE_URL

# Testez la connexion
npx prisma db pull
```

### **Erreur de migration**
```bash
# Réinitialisez la base
npx prisma migrate reset

# Ou forcez le push
npx prisma db push --force-reset
```

### **Erreur de génération**
```bash
# Nettoyez le cache
rm -rf node_modules/.prisma

# Régénérez
npx prisma generate
```

## 📚 **Ressources utiles**

- [Documentation Prisma](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Studio](https://www.prisma.io/docs/concepts/tools/prisma-studio)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

---

**Note** : N'oubliez pas de ne jamais commiter le fichier `.env` dans votre repository Git !
