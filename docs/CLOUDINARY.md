# ☁️ **Configuration Cloudinary - Woodpecker Beats**

## **Vue d'ensemble**

Cette plateforme utilise **Cloudinary** comme fournisseur de stockage cloud pour tous les fichiers audio et images. Cloudinary offre des fonctionnalités avancées de transformation, d'optimisation et de livraison de contenu.

## **🚀 Configuration initiale**

### **1. Création du compte Cloudinary**

1. Allez sur [cloudinary.com](https://cloudinary.com) et créez un compte gratuit
2. Accédez à votre [Dashboard](https://cloudinary.com/console)
3. Notez vos informations d'identification :
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### **2. Variables d'environnement**

Ajoutez ces variables à votre fichier `.env` :

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### **3. Installation des dépendances**

```bash
npm install cloudinary multer @types/multer
```

## **📁 Structure des dossiers**

### **Organisation hiérarchique**

```
woodpecker-beats/
├── beats/
│   ├── previews/     # Previews audio (30s, MP3, qualité optimisée)
│   ├── masters/      # Fichiers masters (WAV, qualité maximale)
│   ├── stems/        # Fichiers stems (ZIP, accès restreint par licence)
│   └── waveforms/    # Waveforms générés automatiquement
├── artwork/
│   └── beats/        # Images d'artwork des beats
└── temp/             # Fichiers temporaires (nettoyage automatique)
```

### **Conventions de nommage**

- **Beats** : `{genre}_{bpm}_{key}_{timestamp}`
- **Stems** : `{genre}_{bpm}_{key}_{timestamp}_stems`
- **Artwork** : `{genre}_{bpm}_{key}_{timestamp}_artwork`

## **🎵 Gestion des fichiers audio**

### **Formats supportés**

| Format | Usage | Qualité | Taille max |
|--------|-------|---------|------------|
| MP3    | Preview | Auto:low | 100MB |
| WAV    | Master | Auto:best | 100MB |
| AIFF   | Master | Auto:best | 100MB |
| FLAC   | Master | Auto:best | 100MB |
| ZIP    | Stems | Raw | 500MB |

### **Transformations audio**

#### **Preview (30 secondes)**
```typescript
{
  resource_type: 'video',
  format: 'mp3',
  quality: 'auto:low',
  duration: 30
}
```

#### **Master (qualité maximale)**
```typescript
{
  resource_type: 'video',
  format: 'wav',
  quality: 'auto:best'
}
```

#### **Stems (fichiers bruts)**
```typescript
{
  resource_type: 'raw',
  format: 'zip',
  // Pas de transformation pour les stems
}
```

#### **Génération de waveform**
```typescript
// Génération automatique d'un waveform
const waveformUrl = await CloudinaryService.generateWaveform(
  publicId,
  {
    width: 800,
    height: 200,
    color: '#6366f1',
    background: 'transparent'
  }
);
```

## **🖼️ Gestion des images**

### **Formats supportés**

| Format | Usage | Qualité | Taille max |
|--------|-------|---------|------------|
| JPG    | Artwork | Auto:good | 10MB |
| JPEG   | Artwork | Auto:good | 10MB |
| PNG    | Artwork | Auto:good | 10MB |
| WebP   | Artwork | Auto:good | 10MB |

### **Transformations automatiques**

#### **Thumbnail (300x300)**
```typescript
{
  width: 300,
  height: 300,
  crop: 'fill',
  quality: 'auto:good'
}
```

#### **Medium (600x600)**
```typescript
{
  width: 600,
  height: 600,
  crop: 'fill',
  quality: 'auto:good'
}
```

#### **Large (1200x1200)**
```typescript
{
  width: 1200,
  height: 1200,
  crop: 'fill',
  quality: 'auto:best'
}
```

## **🔧 API Routes disponibles**

### **1. Upload de beats**
```
POST /api/beats/upload
```

**Fichiers acceptés :**
- `preview` (requis) : Fichier audio preview
- `master` (optionnel) : Fichier audio master
- `stems` (optionnel) : Archive ZIP contenant les stems
- `artwork` (optionnel) : Image d'artwork du beat

**Données du formulaire :**
- `title`, `description`, `genre`, `bpm`, `key`, `duration`
- `wavLeasePrice`, `trackoutLeasePrice`, `unlimitedLeasePrice`
- `tags`, `isExclusive`, `featured`


## **📊 Gestion des ressources**

### **Upload de fichiers**

```typescript
import { CloudinaryService, CLOUDINARY_FOLDERS } from '@/lib/cloudinary';

// Upload audio
const audioResult = await CloudinaryService.uploadAudio(
  fileBuffer,
  CLOUDINARY_FOLDERS.BEATS.PREVIEWS,
  {
    resource_type: 'video',
    format: 'mp3',
    quality: 'auto:low',
    duration: 30
  }
);

// Upload image
const imageResult = await CloudinaryService.uploadImage(
  fileBuffer,
  CLOUDINARY_FOLDERS.ARTWORK.BEATS,
  {
    width: 800,
    height: 800,
    crop: 'fill',
    quality: 'auto:good'
  }
);

// Upload stems
const stemsResult = await CloudinaryService.uploadRaw(
  fileBuffer,
  CLOUDINARY_FOLDERS.BEATS.STEMS,
  {
    resource_type: 'raw',
    format: 'zip'
  }
);
```

### **Suppression de ressources**

```typescript
// Suppression d'une ressource
await CloudinaryService.deleteResource(
  publicId,
  resourceType // 'image', 'video', ou 'raw'
);

// Suppression des stems
await CloudinaryService.deleteResource(
  stemsPublicId,
  'raw'
);
```

### **Génération d'URLs de transformation**

```typescript
// URL avec transformations
const transformedUrl = CloudinaryService.generateTransformUrl(
  publicId,
  {
    width: 300,
    height: 300,
    crop: 'fill'
  },
  'image'
);
```

## **🔄 Nettoyage automatique**

### **Fichiers temporaires**

Le système nettoie automatiquement les fichiers du dossier `temp` :

```typescript
// Nettoyage automatique (peut être programmé)
await CloudinaryService.cleanupTempFiles();
```

### **Gestion des erreurs**

En cas d'échec lors de l'upload, le système nettoie automatiquement les fichiers déjà uploadés :

```typescript
try {
  // Upload des fichiers
  const results = await uploadFiles();
  
  // Création en base
  await createBeat(results);
  
} catch (error) {
  // Nettoyage automatique en cas d'erreur
  for (const result of results) {
    await CloudinaryService.deleteResource(result.public_id, result.resource_type);
  }
}
```

## **⚡ Optimisations de performance**

### **1. Livraison de contenu**

- **CDN global** : Cloudinary utilise un réseau de distribution mondial
- **Format automatique** : Détection automatique du meilleur format selon le navigateur
- **Compression intelligente** : Optimisation automatique de la qualité

### **2. Transformations à la volée**

```typescript
// URL avec transformations en temps réel
const optimizedUrl = cloudinary.url(publicId, {
  width: 300,
  height: 300,
  crop: 'fill',
  quality: 'auto:good',
  format: 'auto' // Format optimal selon le navigateur
});
```

### **3. Cache intelligent**

- **Cache navigateur** : Headers de cache optimisés
- **Cache CDN** : Mise en cache au niveau des serveurs Cloudinary
- **Cache d'application** : Possibilité d'implémenter du cache côté client

## **🔒 Sécurité**

### **1. Authentification**

- **API Key** : Accès limité aux opérations d'upload
- **API Secret** : Accès complet (utilisé côté serveur uniquement)
- **Signed URLs** : Possibilité de générer des URLs signées temporaires

### **2. Validation des fichiers**

```typescript
// Validation des types MIME
const allowedAudioFormats = ['.mp3', '.wav', '.aiff', '.flac'];
const allowedImageFormats = ['.jpg', '.jpeg', '.png', '.webp'];

// Validation des tailles
const maxAudioSize = 100 * 1024 * 1024; // 100MB
const maxImageSize = 10 * 1024 * 1024;   // 10MB
```

### **3. Limites de rate**

- **Upload** : 1000 fichiers par heure (compte gratuit)
- **Transformations** : 25 000 transformations par mois
- **Stockage** : 25GB (compte gratuit)
- **Stems** : Fichiers ZIP jusqu'à 500MB

## **📈 Monitoring et analytics**

### **1. Dashboard Cloudinary**

- **Usage** : Statistiques d'upload et de transformation
- **Performance** : Temps de réponse et disponibilité
- **Coûts** : Utilisation des ressources et facturation

### **2. Logs d'application**

```typescript
// Logging des opérations
console.log(`Upload réussi: ${result.public_id}`);
console.log(`Taille: ${result.bytes} bytes`);
console.log(`Format: ${result.format}`);
```

### **3. Métriques personnalisées**

- **Taux de succès** : Pourcentage d'uploads réussis
- **Temps d'upload** : Durée moyenne des uploads
- **Utilisation du stockage** : Espace utilisé par type de fichier
- **Téléchargements de stems** : Fréquence d'accès aux fichiers stems
- **Répartition des licences** : Usage par type de licence

## **🚨 Dépannage**

### **Erreurs communes**

#### **1. "Invalid API Key"**
- Vérifiez vos variables d'environnement
- Assurez-vous que l'API Key est correcte

#### **2. "File too large"**
- Vérifiez la taille du fichier
- Utilisez la compression si nécessaire

#### **3. "Invalid file format"**
- Vérifiez le type MIME du fichier
- Assurez-vous que le format est supporté

#### **4. "Stems not accessible"**
- Vérifiez que l'utilisateur a la bonne licence
- Confirmez que le fichier stems existe
- Vérifiez les permissions de téléchargement

### **Solutions**

#### **1. Vérification de la configuration**
```typescript
// Test de connexion
try {
  const result = await cloudinary.api.ping();
  console.log('Connexion Cloudinary OK:', result);
} catch (error) {
  console.error('Erreur de connexion:', error);
}
```

#### **2. Validation des fichiers**
```typescript
// Vérification avant upload
const fileInfo = await getFileInfo(file);
if (fileInfo.size > maxSize) {
  throw new Error('Fichier trop volumineux');
}
```

## **🔮 Évolutions futures**

### **1. Fonctionnalités avancées**

- **Watermarking automatique** : Ajout de logos sur les previews
- **Analyse audio** : Détection automatique du BPM et de la tonalité
- **Compression intelligente** : Optimisation automatique selon l'usage
- **Gestion des licences** : Contrôle d'accès basé sur les types de licence
- **Téléchargements sécurisés** : URLs signées avec expiration

### **2. Intégrations**

- **AWS S3** : Migration possible vers S3 si nécessaire
- **Google Cloud Storage** : Alternative pour la distribution
- **Azure Blob Storage** : Solution Microsoft

### **3. Performance**

- **Upload en chunks** : Pour les très gros fichiers
- **Upload parallèle** : Plusieurs fichiers simultanément
- **Cache distribué** : Mise en cache au niveau de l'application

## **📚 Ressources utiles**

### **Documentation officielle**
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)

### **Exemples et tutoriels**
- [Upload Examples](https://cloudinary.com/documentation/node_integration#upload_examples)
- [Video Transformations](https://cloudinary.com/documentation/video_transformations)
- [Best Practices](https://cloudinary.com/documentation/best_practices)

### **Support**
- [Cloudinary Support](https://support.cloudinary.com)
- [Community Forum](https://community.cloudinary.com)
- [GitHub Issues](https://github.com/cloudinary/cloudinary_npm/issues)

---

**Note** : Cette configuration est optimisée pour une utilisation en production avec le système de licences. Testez toujours vos uploads en environnement de développement avant de déployer.

## **🔐 Sécurité des téléchargements**

### **Contrôle d'accès par licence**

- **WAV Lease** : Accès uniquement aux fichiers masters
- **Trackout Lease** : Accès aux masters + stems
- **Unlimited Lease** : Accès aux masters + stems + distribution illimitée

### **URLs signées**

```typescript
// Génération d'URL signée pour téléchargement sécurisé
const signedUrl = cloudinary.utils.api_sign_request({
  public_id: publicId,
  timestamp: Math.round(new Date().getTime() / 1000),
  expiration: Math.round((new Date().getTime() + 30 * 60 * 1000) / 1000) // 30 minutes
}, process.env.CLOUDINARY_API_SECRET)
```
