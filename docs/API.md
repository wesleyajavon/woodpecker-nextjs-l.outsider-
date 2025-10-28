# 🚀 **API Routes Woodpecker Beats**

Ce document décrit toutes les API routes disponibles pour la plateforme Woodpecker Beats.

## 📋 **Vue d'ensemble**

L'API utilise le format JSON et suit les conventions REST. Toutes les réponses incluent un champ `success` et les données dans le champ `data`.

### **Format de réponse standard**
```json
{
  "success": true,
  "data": { ... },
  "message": "Message optionnel"
}
```

### **Format d'erreur standard**
```json
{
  "success": false,
  "error": "Description de l'erreur"
}
```

## 🎵 **API Beats**

### **1. Liste des beats**
```http
GET /api/beats
```

**Paramètres de requête :**
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut: 12, max: 100)
- `search` (optionnel) : Recherche textuelle
- `genre` (optionnel) : Filtrage par genre
- `bpmMin` (optionnel) : BPM minimum
- `bpmMax` (optionnel) : BPM maximum
- `key` (optionnel) : Filtrage par tonalité
- `priceMin` (optionnel) : Prix minimum
- `priceMax` (optionnel) : Prix maximum
- `isExclusive` (optionnel) : Filtrage par exclusivité
- `featured` (optionnel) : Filtrage par mise en vedette
- `sortField` (optionnel) : Champ de tri (défaut: createdAt)
- `sortOrder` (optionnel) : Ordre de tri (défaut: desc)

**Exemple de réponse :**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### **2. Beat par ID**
```http
GET /api/beats/[id]
```

**Paramètres de chemin :**
- `id` : ID unique du beat

**Exemple de réponse :**
```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "title": "Midnight Trap",
    "genre": "Trap",
    "bpm": 140,
    "key": "C#",
    "price": 29.99,
    ...
  }
}
```

### **3. Beats en vedette**
```http
GET /api/beats/featured
```

**Paramètres de requête :**
- `limit` (optionnel) : Nombre de beats (défaut: 4, max: 20)

### **4. Beats par genre**
```http
GET /api/beats/genre/[genre]
```

**Paramètres de chemin :**
- `genre` : Nom du genre (ex: "Trap", "Hip-Hop")

**Paramètres de requête :**
- `limit` (optionnel) : Nombre de beats (défaut: 8, max: 50)

### **5. Statistiques des beats**
```http
GET /api/beats/stats
```

**Exemple de réponse :**
```json
{
  "success": true,
  "data": {
    "totalBeats": 50,
    "totalGenres": 8,
    "averagePrice": 32.50,
    "totalRevenue": 1625.00
  }
}
```

### **6. Vérification d'achat**
```http
GET /api/beats/[id]/purchase-check?email=client@example.com
```

**Paramètres de chemin :**
- `id` : ID du beat

**Paramètres de requête :**
- `email` : Email du client

**Exemple de réponse :**
```json
{
  "success": true,
  "data": {
    "beatId": "clx123...",
    "customerEmail": "client@example.com",
    "hasPurchased": false,
    "message": "Ce beat n'a pas encore été acheté par ce client"
  }
}
```

## 🛒 **API Commandes**

### **1. Liste des commandes**
```http
GET /api/orders
```

**Paramètres de requête :**
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut: 20, max: 100)
- `customerEmail` (optionnel) : Filtrage par email client
- `status` (optionnel) : Filtrage par statut
- `licenseType` (optionnel) : Filtrage par type de licence
- `dateFrom` (optionnel) : Date de début (format ISO)
- `dateTo` (optionnel) : Date de fin (format ISO)
- `beatId` (optionnel) : Filtrage par beat
- `sortField` (optionnel) : Champ de tri (défaut: createdAt)
- `sortOrder` (optionnel) : Ordre de tri (défaut: desc)

### **2. Créer une commande**
```http
POST /api/orders
```

**Corps de la requête :**
```json
{
  "customerEmail": "client@example.com",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "totalAmount": 29.99,
  "currency": "EUR",
  "paymentMethod": "Stripe",
  "paymentId": "pi_1234567890",
  "licenseType": "NON_EXCLUSIVE",
  "usageRights": ["Commercial Use", "Streaming"],
  "beatId": "clx123..."
}
```

**Champs requis :**
- `customerEmail` : Email du client
- `totalAmount` : Montant total
- `beatId` : ID du beat

### **3. Commande par ID**
```http
GET /api/orders/[id]
PUT /api/orders/[id]
```

**Paramètres de chemin :**
- `id` : ID unique de la commande

**PUT - Corps de la requête :**
```json
{
  "customerName": "John Doe",
  "status": "PAID",
  "licenseType": "EXCLUSIVE"
}
```

### **4. Actions sur les commandes**
```http
PATCH /api/orders/[id]/actions
```

**Corps de la requête :**
```json
{
  "action": "cancel"
}
```

**Actions disponibles :**
- `cancel` : Annuler la commande
- `refund` : Rembourser la commande
- `mark-paid` : Marquer comme payée
- `mark-completed` : Marquer comme terminée

### **5. Statistiques des commandes**
```http
GET /api/orders/stats
```

**Exemple de réponse :**
```json
{
  "success": true,
  "data": {
    "totalOrders": 25,
    "totalRevenue": 1250.00,
    "pendingOrders": 3,
    "completedOrders": 22,
    "monthlyRevenue": [...]
  }
}
```

### **6. Commandes par client**
```http
GET /api/orders/customer/[email]
```

**Paramètres de chemin :**
- `email` : Email du client

## 🔐 **Sécurité et validation**

### **Validation des données**
- Tous les paramètres sont validés côté serveur
- Validation des formats d'email
- Validation des montants et limites
- Protection contre les injections SQL

### **Gestion des erreurs**
- Codes de statut HTTP appropriés
- Messages d'erreur descriptifs
- Logs détaillés côté serveur

### **Rate Limiting**
- Limitation du nombre de requêtes par IP
- Protection contre les abus

## 📊 **Codes de statut HTTP**

- `200` : Succès
- `201` : Créé avec succès
- `400` : Requête invalide
- `404` : Ressource non trouvée
- `409` : Conflit (ex: beat déjà acheté)
- `500` : Erreur interne du serveur

## 🧪 **Exemples d'utilisation**

### **Récupérer tous les beats trap**
```bash
curl "http://localhost:3000/api/beats?genre=Trap&limit=20"
```

### **Rechercher des beats par mot-clé**
```bash
curl "http://localhost:3000/api/beats?search=dark&genre=Trap&bpmMin=130&bpmMax=150"
```

### **Créer une commande**
```bash
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "client@example.com",
    "totalAmount": 29.99,
    "beatId": "clx123..."
  }'
```

### **Vérifier si un client a acheté un beat**
```bash
curl "http://localhost:3000/api/beats/clx123.../purchase-check?email=client@example.com"
```

## 📚 **Ressources utiles**

- [Documentation Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Note** : Toutes les API routes sont protégées et validées. Testez toujours vos requêtes en développement avant de les utiliser en production.
