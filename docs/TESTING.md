# 🧪 **Guide de Test - Upload Cloudinary**

## **Vue d'ensemble**

Ce guide vous accompagne pour tester l'upload de beats vers Cloudinary et vérifier l'intégration complète de la plateforme.

## **🚀 Prérequis**

### **1. Configuration Cloudinary**
```bash
# Vérifiez que ces variables sont dans votre .env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### **2. Base de données**
```bash
# Assurez-vous que PostgreSQL est en cours d'exécution
npm run db:push
npm run db:seed
```

### **3. Serveur de développement**
```bash
npm run dev
```

## **📋 Tests à effectuer**

### **Phase 1 : Test de base de l'upload**

#### **1.1 Page de test d'upload**
- **URL** : `http://localhost:3000/upload-test`
- **Objectif** : Tester le composant BeatUpload en isolation

#### **1.2 Tests de fichiers audio**
- **Preview (requis)** :
  - Format : MP3, WAV, AIFF, FLAC
  - Taille : < 200MB
  - Durée : Variable (sera tronquée à 30s)
- **Master (optionnel)** :
  - Format : WAV, AIFF, FLAC
  - Taille : < 200MB
  - Qualité : Haute définition
- **Stems (optionnel)** :
  - Format : ZIP, RAR
  - Taille : < 1GB

#### **1.3 Tests d'images**
- **Artwork (optionnel)** :
  - Format : JPG, JPEG, PNG, WebP
  - Taille : < 20MB
  - Résolution : Variable (sera redimensionnée)

### **Phase 2 : Validation des données**

#### **2.1 Champs obligatoires**
- [ ] Titre (max 100 caractères)
- [ ] Genre (sélection dans la liste)
- [ ] BPM (60-200)
- [ ] Tonalité (sélection dans la liste)
- [ ] Durée (format MM:SS)
- [ ] Prix (> 0)

#### **2.2 Champs optionnels**
- [ ] Description (max 500 caractères)
- [ ] Tags (max 10, 20 caractères chacun)
- [ ] Beat exclusif (checkbox)
- [ ] Beat en vedette (checkbox)

### **Phase 3 : Test de l'intégration**

#### **3.1 Upload vers Cloudinary**
- [ ] Fichiers uploadés dans les bons dossiers
- [ ] URLs sécurisées générées
- [ ] Transformations appliquées
- [ ] Métadonnées correctes

#### **3.2 Base de données**
- [ ] Beat créé avec succès
- [ ] URLs des fichiers enregistrées
- [ ] Métadonnées sauvegardées
- [ ] Relations correctes

#### **3.3 Interface utilisateur**
- [ ] Barres de progression
- [ ] Messages de succès/erreur
- [ ] Reset du formulaire
- [ ] Affichage des beats uploadés

## **🔧 Tests spécifiques par type de fichier**

### **Fichiers audio**

#### **Test MP3 Preview**
```bash
# Créer un fichier de test
ffmpeg -f lavfi -i "sine=frequency=440:duration=60" -acodec mp3 test_preview.mp3
```
**Vérifications** :
- Upload réussi vers `woodpecker-beats/beats/previews/`
- Format converti en MP3
- Qualité optimisée
- Durée limitée à 30 secondes

#### **Test WAV Master**
```bash
# Créer un fichier de test
ffmpeg -f lavfi -i "sine=frequency=440:duration=120" -acodec pcm_s16le test_master.wav
```
**Vérifications** :
- Upload réussi vers `woodpecker-beats/beats/masters/`
- Format préservé (WAV)
- Qualité maximale
- Durée complète préservée

### **Fichiers images**

#### **Test JPG Artwork**
**Vérifications** :
- Upload réussi vers `woodpecker-beats/beats/`
  - Medium 600x600
  - Large 1200x1200
- URLs de transformation générées

## **📊 Tests de performance**

### **Temps d'upload**
- **Fichier < 1MB** : < 5 secondes
- **Fichier 1-10MB** : < 30 secondes
- **Fichier 10-100MB** : < 3 minutes
- **Fichier 100-200MB** : < 5 minutes (traitement asynchrone)

### **Gestion des erreurs**
- **Fichier trop volumineux** : Message d'erreur approprié
- **Format non supporté** : Validation côté client et serveur
- **Connexion perdue** : Retry automatique
- **Quota dépassé** : Message d'erreur Cloudinary

## **🔄 Tests de régression**

### **Après chaque modification**
1. **Upload de tous les types de fichiers**
2. **Validation de tous les champs**
3. **Vérification des transformations**
4. **Test de la base de données**
5. **Vérification de l'interface**

### **Tests de stress**
- **Upload simultané** : 3-5 fichiers en même temps
- **Fichiers volumineux** : 50-100MB
- **Sessions longues** : Upload pendant 1 heure
- **Nettoyage automatique** : Vérifier la suppression des fichiers temporaires

## **🚨 Dépannage**

### **Erreurs communes**

#### **"Invalid API Key"**
```bash
# Vérifier les variables d'environnement
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY
echo $CLOUDINARY_API_SECRET
```

#### **"File too large"**
```bash
# Vérifier les limites dans src/lib/upload.ts
# Vérifier la configuration Cloudinary
```

#### **"Database connection failed"**
```bash
# Vérifier PostgreSQL
npm run db:push
npm run db:seed
```

### **Logs utiles**

#### **Console navigateur**
```javascript
// Activer les logs détaillés
localStorage.setItem('debug', 'true');
```

#### **Logs serveur**
```bash
# Vérifier les logs Next.js
npm run dev
```

#### **Logs Cloudinary**
- Dashboard Cloudinary : [cloudinary.com/console](https://cloudinary.com/console)
- Section "Media Library" pour voir les fichiers uploadés
- Section "Usage" pour vérifier les quotas

## **✅ Checklist de validation**

### **Fonctionnalités de base**
- [ ] Upload de preview audio
- [ ] Upload de master audio
- [ ] Validation des champs
- [ ] Gestion des erreurs
- [ ] Messages de succès

### **Intégration Cloudinary**
- [ ] Fichiers dans les bons dossiers
- [ ] URLs sécurisées
- [ ] Transformations automatiques
- [ ] Métadonnées correctes
- [ ] Nettoyage des erreurs

### **Base de données**
- [ ] Création des beats
- [ ] Enregistrement des URLs
- [ ] Métadonnées complètes
- [ ] Relations correctes

### **Interface utilisateur**
- [ ] Formulaire responsive
- [ ] Barres de progression
- [ ] Gestion des états
- [ ] Navigation entre pages
- [ ] Intégration dans l'admin

## **🎯 Tests avancés**

### **Sécurité**
- [ ] Validation des types MIME
- [ ] Limitation des tailles
- [ ] Sanitisation des noms de fichiers
- [ ] Protection contre l'upload malveillant

### **Performance**
- [ ] Upload en parallèle
- [ ] Compression automatique
- [ ] Cache des transformations
- [ ] Optimisation des images

### **Accessibilité**
- [ ] Navigation au clavier
- [ ] Messages d'erreur clairs
- [ ] Support des lecteurs d'écran
- [ ] Contraste des couleurs

## **📈 Métriques de succès**

### **Taux de réussite**
- **Uploads réussis** : > 95%
- **Temps de réponse** : < 3 secondes
- **Erreurs utilisateur** : < 5%

### **Qualité des fichiers**
- **Audio** : Qualité préservée
- **Images** : Transformations correctes
- **Métadonnées** : 100% complètes

### **Expérience utilisateur**
- **Interface intuitive** : Feedback positif
- **Gestion des erreurs** : Messages clairs
- **Performance** : Uploads fluides

---

**Note** : Ce guide doit être mis à jour à chaque nouvelle fonctionnalité ou modification de l'upload.
