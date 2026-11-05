# Correction de l'édition des stems admin

Runbook pour réparer la poubelle et le remplacement des stems sur `/admin/beats/[beatId]/edit`.

Chaque étape est un chat séparé. Colle le prompt de l'étape, attends que les critères d'acceptation soient vrais, puis passe à la suivante. Ne lance pas deux étapes dans le même chat.

Coche au fur et à mesure :

- [ ] Étape 1 — Service `clearBeatStems` / `attachBeatStems`
- [ ] Étape 2 — Routes admin `DELETE` et `PUT`
- [ ] Étape 3 — Poubelle branchée sur `DELETE`
- [ ] Étape 4 — Remplacement par upload S3 direct
- [ ] Étape 5 — Fermeture de l'upload ZIP via `/files`
- [ ] Étape 6 — Téléchargement legacy sur `s3StemsKey`
- [ ] Étape 7 — Vérification manuelle

## Symptôme

Sur la page d'édition, la poubelle rouge ne retire pas le ZIP affiché. Le bouton « remplacer les stems » sélectionne un fichier local, puis l'envoi passe par le serveur Next, qui charge le ZIP entier en mémoire. L'erreur n'apparaît pas dans l'interface.

## Où sont les données

PostgreSQL (Prisma, `DATABASE_URL`) ne garde que des pointeurs. Les octets des stems sont sur AWS S3.

| Rôle | Détail |
| --- | --- |
| Bucket | `AWS_S3_BUCKET_NAME` |
| Région | `AWS_REGION`, défaut `us-east-1` |
| Clés | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| Préfixe réel | `beats/stems/{timestamp}-{id}-{nom}.zip` |
| Code | `src/lib/aws-s3.ts` (`S3_CONFIG.folders.BEATS.STEMS`), `src/lib/s3-service.ts` |

`docs/aws-s3-implementation.md` décrit encore `stems/{beatId}/stems.zip`. Ce chemin n'est pas celui du code. Les étapes suivent `S3_CONFIG`, pas ce document.

Trois colonnes sur `Beat` (`prisma/schema.prisma`) :

- `s3StemsKey` — clé de l'objet S3. C'est le fichier.
- `s3StemsUrl` — URL publique miroir, construite par `S3_CONFIG.getPublicUrl`.
- `stemsUrl` — même URL, lue encore par le catalogue et par `src/app/api/download/stems/[beatId]/route.ts`.

À la création (`src/app/api/beats/upload/route.ts`), les trois colonnes reçoivent la même URL S3, et `s3StemsKey` reçoit la clé. L'upload création passe déjà par une URL signée (`src/components/S3Upload.tsx` → `GET /api/s3/upload`), avec repli `POST /api/s3/upload-proxy` si le CORS bloque.

La page d'édition fait autre chose :

- La poubelle (`handleRemoveStems` dans `src/app/admin/beats/[id]/edit/page.tsx`) envoie `PUT /api/beats/[id]` avec `{ stemsUrl: null }` via `useUpdateBeat`.
- L'écran (`src/components/ui/BeatEditCard.tsx`) affiche le ZIP seulement si `beat.s3StemsUrl` est rempli. `s3StemsUrl` et `s3StemsKey` restent en place, donc la poubelle semble morte.
- Le `PATCH` de `src/app/api/beats/[id]/route.ts` tente un `deleteResource` Cloudinary quand `stemsUrl` vaut `null`. Le client appelle `PUT`, pas `PATCH`. Une URL S3 n'a pas de `public_id` Cloudinary.
- `s3Service.deleteFile` existe et n'est pas appelé par cette page.
- Le champ « remplacer » met un `File` dans le state React. L'envoi réel est le bouton « Enregistrer les fichiers », qui fait `PUT /api/beats/[id]/files` avec le ZIP dans le `FormData`. Cette route bufferise le fichier, l'envoie à S3, et n'écrit que `s3StemsUrl` / `s3StemsKey`. Elle ne met pas `stemsUrl` à jour et ne supprime pas l'ancienne clé.
- `S3Upload` (le chemin qui tient un gros ZIP) n'est rendu que lorsqu'il n'y a pas encore de `s3StemsUrl`.
- `PUT /api/beats/[id]/files` charge le beat avec `getBeatById(id)` sans `includeInactive`. Un beat planifié (`isActive: false` ou `scheduledReleaseAt` dans le futur) répond 404, alors que la page d'édition le charge avec `includeInactive: true`.

Le téléchargement acheteur actuel (`src/app/api/download/beat/[beatId]/route.ts`, `type=stems`) signe `s3StemsKey` pour 30 minutes. L'ancienne route `src/app/api/download/stems/[beatId]/route.ts` exige `stemsUrl` et le signe comme un fichier Cloudinary.

## Contrat

Toutes les étapes respectent ceci.

- La source de vérité du fichier est `s3StemsKey`.
- Après un attachement, `stemsUrl` et `s3StemsUrl` contiennent la même URL.
- Suppression : écrire `null` dans les trois colonnes, puis appeler `s3Service.deleteFile` sur l'ancienne clé. Si S3 échoue, logger l'erreur et garder la base déjà mise à jour. Ne pas supprimer S3 avant la base.
- Remplacement : le navigateur envoie le ZIP vers S3 avec l'URL signée déjà utilisée par `S3Upload`. Ensuite la route écrit les trois colonnes, puis supprime l'ancienne clé si elle est différente. Même règle si la suppression S3 échoue.
- Le ZIP d'édition ne transite plus par `PUT /api/beats/[id]/files`.
- Les routes nouvelles exigent une session et `isUserAdmin` (`src/lib/roleUtils.ts`). Le beat est chargé avec `BeatService.getBeatById(id, undefined, false, true)` pour inclure les beats planifiés.
- Une clé acceptée commence par `beats/stems/`.

## Hors scope

Ne pas modifier dans ces étapes :

- le master WAV (`s3MasterUrl`, `s3MasterKey`, `fullUrl`) ;
- l'artwork Cloudinary, y compris la poubelle artwork qui envoie `PUT { artworkUrl: null }` alors que le nettoyage Cloudinary est dans le `PATCH` ;
- le widget d'upload de création (`src/components/BeatUpload.tsx` et `POST /api/beats/upload`) ;
- une migration qui ferait lire `s3StemsUrl` partout à la place de `stemsUrl` ;
- `docs/aws-s3-implementation.md` ;
- un commit git, sauf demande explicite dans le chat.

## Comment utiliser un prompt

Ouvre un chat neuf sur ce dépôt. Colle le bloc tel quel. Le prompt dit de ne traiter que cette étape. À la fin, vérifie les critères d'acceptation avant de continuer.

---

## Étape 1 — Service unique

### Objectif

Deux fonctions serveur qui sont le seul endroit où les trois colonnes et la suppression S3 bougent ensemble. Pas de route, pas d'UI.

### Fichiers

- Créer `src/services/beatStemsService.ts`
- Lire `src/lib/prisma.ts`, `src/lib/s3-service.ts`, `src/services/beatService.ts` (`convertPrismaBeat` est privé : ne pas l'appeler depuis l'extérieur)
- Lire `src/types/beat.ts` (`Beat`)

### Ne pas faire

- Ne pas élargir `BeatService.updateBeat` pour servir de suppression ou de remplacement. Son objet `updateData` ne déclare pas les colonnes stems, et `scheduledReleaseAt` y change aussi `isActive`.
- Ne pas appeler Cloudinary.
- Ne pas ajouter de route ni toucher à `BeatEditCard`.
- Ne pas supprimer l'objet S3 avant le `prisma.beat.update`.
- Ne pas committer.

### Prompt à coller

```text
Tu travailles dans le dépôt woodpecker-nextjs-backup. Réponds en français. Ne fais qu'une chose : ajouter le service stems. Pas de route, pas d'UI, pas de commit.

Contexte. Les stems d'un beat sont un ZIP sur AWS S3, préfixe réel beats/stems/ (voir S3_CONFIG.folders.BEATS.STEMS dans src/lib/aws-s3.ts). Le modèle Prisma Beat a trois colonnes : s3StemsKey (clé S3, source de vérité), s3StemsUrl et stemsUrl (la même URL publique). s3Service.deleteFile(key) est dans src/lib/s3-service.ts. prisma est exporté par src/lib/prisma.ts. Le type Beat est dans src/types/beat.ts. BeatService.convertPrismaBeat est privé : ne l'utilise pas.

Crée src/services/beatStemsService.ts avec deux fonctions exportées.

clearBeatStems(beatId: string): Promise<Beat>
- Charge le beat par id avec prisma.beat.findUnique. S'il n'existe pas, lance une erreur « Beat non trouvé ».
- Mémorise s3StemsKey actuel.
- Met à jour le beat : stemsUrl, s3StemsUrl et s3StemsKey à null.
- Après le update réussi, si une ancienne clé existe, appelle s3Service.deleteFile. Si cet appel jette, console.error et n'annule pas la mise à jour base.
- Retourne le beat converti comme BeatService le fait pour les prix Decimal : wavLeasePrice, trackoutLeasePrice et unlimitedLeasePrice en number. Duplique ce petit mapping dans ce fichier plutôt que d'ouvrir convertPrismaBeat.

attachBeatStems(beatId: string, input: { url: string; key: string }): Promise<Beat>
- Refuse une url vide ou une key vide.
- Refuse une key qui ne commence pas par "beats/stems/".
- Charge le beat. S'il n'existe pas, lance « Beat non trouvé ».
- Mémorise l'ancienne s3StemsKey.
- Écrit stemsUrl = url, s3StemsUrl = url, s3StemsKey = key. Les deux URL sont identiques.
- Après le update réussi, si l'ancienne clé existe et qu'elle est différente de la nouvelle, deleteFile en best-effort (log, ne pas faire échouer la fonction).
- Même conversion Decimal → number au retour.

N'ajoute pas de test automatisé. N'importe pas Cloudinary. Ne modifie pas BeatService.updateBeat.
```

### Critères d'acceptation

- `src/services/beatStemsService.ts` exporte `clearBeatStems` et `attachBeatStems`.
- Les deux fonctions écrivent les trois colonnes dans le même `update`.
- `deleteFile` est après le `update`, dans un try/catch qui ne relance pas.
- `attachBeatStems` ne supprime pas la clé quand elle est identique à la nouvelle.
- Une clé hors de `beats/stems/` est refusée.
- `BeatService.updateBeat`, les routes et l'UI sont inchangés.

---

## Étape 2 — Routes admin

### Objectif

Exposer le service derrière une route réservée aux admins, y compris pour un beat planifié.

### Fichiers

- Créer `src/app/api/beats/[id]/stems/route.ts`
- S'appuyer sur `src/services/beatStemsService.ts` (étape 1)
- Reprendre le style de `src/app/api/beats/[id]/route.ts` : `params` est une `Promise`, `getServerSession(authOptions)` depuis `src/lib/auth.ts`
- `isUserAdmin` est dans `src/lib/roleUtils.ts`
- `BeatService.getBeatById(id, userId?, isAdmin?, includeInactive?)` est dans `src/services/beatService.ts`. Le quatrième argument `true` inclut les beats inactifs et planifiés.

### Ne pas faire

- Ne pas brancher l'UI (étapes 3 et 4).
- Ne pas réutiliser `PUT /api/beats/[id]` ni son `PATCH` Cloudinary.
- Ne pas accepter un body `{ stemsUrl: null }` comme suppression : la suppression est `DELETE`.
- Ne pas vérifier la propriété `userId` du beat. L'admin édite tous les beats, comme la page actuelle.
- Ne pas committer.

### Prompt à coller

```text
Tu travailles dans le dépôt woodpecker-nextjs-backup. Réponds en français. Ne fais qu'une chose : la route admin des stems. Pas d'UI, pas de commit. L'étape 1 est déjà en place : src/services/beatStemsService.ts exporte clearBeatStems(beatId) et attachBeatStems(beatId, { url, key }).

Crée src/app/api/beats/[id]/stems/route.ts. Dans ce projet, params est une Promise : interface RouteParams { params: Promise<{ id: string }> } puis const { id } = await params. Copie ce modèle depuis src/app/api/beats/[id]/route.ts.

Auth, identique pour DELETE et PUT :
- getServerSession(authOptions) depuis @/lib/auth. Sans session.user.email → 401 { error: "Authentification requise" }.
- isUserAdmin(session.user.email) depuis @/lib/roleUtils. Si false → 403 { error: "Accès admin requis" }.
- Sans id → 400.
- BeatService.getBeatById(id, undefined, false, true). Le true inclut les beats planifiés et inactifs. Si null → 404 { error: "Beat non trouvé" }.

DELETE : appelle clearBeatStems(id). Réponds 200 { success: true, message: "Stems supprimés", data: beat }.

PUT : lis le JSON. Le body valide est { url: string, key: string }, les deux non vides après trim. Sinon 400 { error: "url et key sont requis" }. Un body qui ne contient que stemsUrl: null est un 400, pas une suppression. Appelle attachBeatStems(id, { url, key }). Si le service refuse la clé (elle doit commencer par beats/stems/), réponds 400 avec le message de l'erreur. Réponds 200 { success: true, message: "Stems mis à jour", data: beat }.

Les erreurs inattendues → 500 { error: "Erreur interne du serveur" } et console.error. N'importe pas Cloudinary. Ne modifie pas src/app/api/beats/[id]/route.ts ni la page d'édition.
```

### Critères d'acceptation

- `DELETE /api/beats/[id]/stems` et `PUT /api/beats/[id]/stems` existent.
- Un utilisateur non admin reçoit 403. Une session absente reçoit 401.
- Un beat avec `isActive: false` ou `scheduledReleaseAt` futur est trouvé.
- `PUT` sans `url` et `key` reçoit 400.
- Le handler ne parle qu'à `beatStemsService`.
- La page d'édition appelle encore l'ancien `PUT` avec `{ stemsUrl: null }`. C'est normal jusqu'à l'étape 3.

---

## Étape 3 — Poubelle

### Objectif

La poubelle rouge vide les trois colonnes et retire l'objet S3. L'échec s'affiche dans la carte rouge déjà présente.

### Fichiers

- `src/app/admin/beats/[id]/edit/page.tsx` — `handleRemoveStems` envoie aujourd'hui `useUpdateBeat` avec `{ stemsUrl: null }`
- `src/components/ui/BeatEditCard.tsx` — la poubelle est le bouton `Trash2` qui appelle `onRemoveStems` ; le bandeau rouge rend la prop `error: string | null`
- La page passe aujourd'hui l'erreur de `useBeat` à cette prop. Cette erreur de chargement doit rester visible. L'erreur d'action stems est un state à part, affiché dans le même bandeau.

### Ne pas faire

- Ne pas changer le remplacement (l'`input` `.zip` et `formData.append('stems')` restent jusqu'à l'étape 4).
- Ne pas changer la poubelle artwork ni le master.
- Ne pas appeler `useUpdateBeat` pour les stems.
- Ne pas committer.

### Prompt à coller

```text
Tu travailles dans le dépôt woodpecker-nextjs-backup. Réponds en français. Ne fais qu'une chose : brancher la poubelle stems de /admin/beats/[id]/edit sur DELETE /api/beats/[id]/stems. Pas de commit. Les étapes 1 et 2 sont déjà en place. Ne touche pas au remplacement de fichier, à l'artwork, ni au master.

Dans src/app/admin/beats/[id]/edit/page.tsx, handleRemoveStems fait aujourd'hui updateBeatMutation.mutateAsync({ id: beatId, data: { stemsUrl: null } }). Remplace cet appel par fetch DELETE /api/beats/${beatId}/stems, sans body.

Comportement :
- Si !beat, return.
- setIsUploading(true) le temps de l'appel, puis false dans finally.
- Si la réponse n'est pas ok, lis le JSON et prends error, sinon un message fixe « Suppression des stems impossible ».
- Garde ce message dans un state local actionError: string | null. Remets-le à null au début d'une nouvelle suppression.
- En succès : actionError à null, puis refetch() déjà utilisé par la page (useBeat).
- console.error peut rester en plus, mais le message doit arriver à l'UI.

BeatEditCard (src/components/ui/BeatEditCard.tsx) affiche déjà la prop error dans le bandeau rouge (AlertCircle). La page lui passe aujourd'hui l'erreur de useBeat, qui n'est pas une string. Passe une string : actionError en priorité, sinon error instanceof Error ? error.message : null. Ne change pas le bandeau lui-même si ce passage suffit.

Ne retire pas l'input zip, ni formData.append('stems'), ni S3Upload. Ne change pas onRemoveArtwork.
```

### Critères d'acceptation

- La poubelle n'envoie plus `{ stemsUrl: null }`.
- Elle appelle `DELETE /api/beats/${beatId}/stems`.
- Après succès, `refetch()` tourne. Au rechargement, `s3StemsUrl` vide fait afficher l'état « pas de stems » (le rendu actuel de `BeatEditCard` quand `beat.s3StemsUrl` est absent).
- Une réponse 401, 403 ou 500 affiche le texte dans le bandeau rouge.
- L'artwork, le master et le champ « remplacer » local sont inchangés.

---

## Étape 4 — Remplacement par upload S3 direct

### Objectif

Remplacer le ZIP par le même chemin que la création : `S3Upload` envoie le fichier à S3, puis `PUT /api/beats/[id]/stems` enregistre `url` et `key`. Le ZIP ne passe plus par le state React ni par le bouton « Enregistrer les fichiers ».

### Fichiers

- `src/components/ui/BeatEditCard.tsx` — `S3Upload` (`folder="stems"`) n'est rendu que dans le `else` de `beat.s3StemsUrl`. L'`input#stems-upload` (`accept=".zip"`) appelle `onFileSelect('stems')`. Le libellé existant est `t('admin.replaceStemsFile')`.
- `src/components/S3Upload.tsx` — `onUploadComplete({ url, key })` après l'URL signée ou le proxy. Ne le réécris pas.
- `src/app/admin/beats/[id]/edit/page.tsx` — `handleS3UploadComplete('stems')` appelle encore `useUpdateBeat` avec seulement `s3StemsUrl` et `s3StemsKey`. `handleUpload` fait `formData.append('stems', ...)` et simule la progression avec `setInterval`, y compris `stems`.

### Ne pas faire

- Ne pas réécrire `S3Upload`, `GET /api/s3/upload`, ni le proxy.
- Ne pas changer le flux master dans `handleS3UploadComplete` : la branche `master` reste sur `useUpdateBeat`.
- Ne pas envoyer le ZIP dans `PUT /api/beats/[id]/files` depuis cette page.
- Ne pas ajouter de clés i18n si `admin.replaceStemsFile` suffit.
- Ne pas committer.

### Prompt à coller

```text
Tu travailles dans le dépôt woodpecker-nextjs-backup. Réponds en français. Ne fais qu'une chose : le remplacement des stems sur la page d'édition passe par S3Upload puis PUT /api/beats/[id]/stems. Pas de commit. Les étapes 1 à 3 sont en place. La poubelle DELETE reste telle qu'elle est. Ne modifie pas le master, l'artwork, ni la preview.

Dans src/components/ui/BeatEditCard.tsx, la section stems (titre upload.stems) cache S3Upload dès que beat.s3StemsUrl existe, et propose un input#stems-upload qui ne fait que onFileSelect('stems').

Nouveau rendu de cette section :
- Si beat.s3StemsUrl : garder le bandeau « fichier disponible », la poubelle onRemoveStems, et la ligne mono de beat.s3StemsKey.
- Toujours afficher S3Upload avec beatId, folder="stems", maxSize={1024}, acceptedTypes zip (application/zip et application/x-zip-compressed), onUploadError={onS3UploadError}. Quand un ZIP existe déjà, un texte au-dessus du widget utilise t('admin.replaceStemsFile'). Quand il n'y en a pas, garde le texte admin.noStemsFile.
- onUploadComplete du widget stems appelle onS3UploadComplete('stems', result).
- Supprime l'input#stems-upload et son label. Les stems ne sont plus un fichier local de cette carte.

Dans src/app/admin/beats/[id]/edit/page.tsx :
- handleS3UploadComplete : la branche master reste updateBeatMutation avec s3MasterUrl et s3MasterKey. La branche stems ne passe plus par useUpdateBeat. Elle fait PUT /api/beats/${beatId}/stems avec headers Content-Type application/json et body JSON { url: result.url, key: result.key }.
- Succès : actionError à null (le state ajouté à l'étape 3), refetch().
- Échec : message de la réponse dans actionError, comme la poubelle. console.error en plus.
- handleUpload : ne plus faire formData.append('stems'). Retire stems du setInterval de progression et de l'objet uploadProgress si plus rien ne le lit. Retire stems de uploadedFiles si le type et les handlers preview/master/artwork peuvent rester sans ce champ. Ne casse pas l'enregistrement preview, master et artwork.
- S3Upload a déjà sa propre barre. Ne simule plus une progression stems.

Ne change pas src/components/S3Upload.tsx. Ne supprime pas le bouton « Enregistrer les fichiers » : il sert encore aux autres fichiers.
```

### Critères d'acceptation

- Avec un ZIP déjà présent, `S3Upload` est visible et le texte `admin.replaceStemsFile` aussi.
- Choisir un ZIP ne remplit plus `uploadedFiles.stems` et n'active pas la barre simulée des stems.
- Au succès de `S3Upload`, la page envoie `PUT` avec `{ url, key }` puis `refetch()`.
- La branche master de `handleS3UploadComplete` est inchangée.
- `handleUpload` n'ajoute plus de champ `stems` au `FormData`.

---

## Étape 5 — Fermer l'ancien chemin ZIP

### Objectif

`PUT /api/beats/[id]/files` refuse un ZIP stems, et trouve les beats planifiés pour que preview et artwork restent éditables.

### Fichiers

- `src/app/api/beats/[id]/files/route.ts`
- Aujourd'hui : `BeatService.getBeatById(id)` sans `includeInactive`, puis si `files.stems[0]` le buffer part dans `s3Service.uploadFile` et seuls `s3StemsUrl` / `s3StemsKey` sont écrits.

### Ne pas faire

- Ne pas uploader le ZIP « quand même » dans cette route, même en déléguant à `attachBeatStems` après coup. Il n'y a plus qu'un chemin d'écriture : l'étape 4.
- Ne pas changer l'upload preview (Cloudinary), master (S3) ni artwork (Cloudinary) de cette route, à part le chargement du beat.
- Ne pas committer.

### Prompt à coller

```text
Tu travailles dans le dépôt woodpecker-nextjs-backup. Réponds en français. Ne fais qu'une chose : fermer l'upload stems dans PUT /api/beats/[id]/files, et permettre l'édition des autres fichiers d'un beat planifié. Pas de commit. Le remplacement stems passe déjà par S3Upload puis PUT /api/beats/[id]/stems (étapes 1 à 4). Ne touche pas à ces fichiers.

Fichier : src/app/api/beats/[id]/files/route.ts.

1. Après avoir lu le FormData et construit l'objet files, si files.stems est présent, réponds tout de suite 400 :
   { error: "Les stems se mettent à jour via PUT /api/beats/[id]/stems après un upload S3 direct. N'envoyez pas le ZIP sur cette route." }
   Ce retour est avant tout upload Cloudinary ou S3, pour ne pas laisser un preview déjà envoyé si le client a aussi joint un ZIP.

2. Remplace BeatService.getBeatById(id) par BeatService.getBeatById(id, undefined, false, true). Le quatrième argument inclut les beats inactifs et ceux dont scheduledReleaseAt est dans le futur. Sans ça, la page d'édition affiche le beat et cette route répond 404.

3. Supprime le bloc qui upload files.stems vers S3 et qui assigne updateData.s3StemsUrl / s3StemsKey. Preview, master et artwork restent.

Ne change pas l'auth déjà présente (session + utilisateur). N'ajoute pas isUserAdmin ici : ce n'est pas le sujet de cette étape. Ne modifie pas la page d'édition.
```

### Critères d'acceptation

- Un `FormData` qui contient `stems` reçoit 400 et aucun appel `s3Service.uploadFile` pour ce ZIP.
- Preview, master et artwork continuent d'être uploadés quand le formulaire n'a pas de champ `stems`.
- `getBeatById` est appelé avec `includeInactive: true`.
- La page d'édition n'envoie déjà plus de stems ici (étape 4). Cette étape verrouille le serveur.

---

## Étape 6 — Téléchargement legacy

### Objectif

`GET /api/download/stems/[beatId]` délivre le ZIP S3 signé à partir de `s3StemsKey`, avec les mêmes conditions d'achat qu'aujourd'hui. La forme JSON de la réponse reste la même.

### Fichiers

- `src/app/api/download/stems/[beatId]/route.ts` — exige `beat.stemsUrl`, puis `CloudinaryService.generateSignedUrl` sur un `public_id` découpé dans cette URL.
- Modèle à suivre pour la signature : `src/app/api/download/beat/[beatId]/route.ts`, branche `type === 'stems'`, `s3Service.generatePresignedDownloadUrl(beat.s3StemsKey, 30 * 60)`.
- `s3Service` est importé depuis `@/lib/s3-service`.

### Ne pas faire

- Ne pas signer `stemsUrl` comme un `public_id` Cloudinary, même en repli. Un beat qui n'a que `stemsUrl` et pas de `s3StemsKey` répond 404 jusqu'à un ré-upload admin.
- Ne pas changer le JSON `{ success, downloadUrl, expiresAt, beatTitle }`.
- Ne pas retirer le contrôle de licence Trackout / Unlimited ni l'auth session.
- Ne pas committer.

### Prompt à coller

```text
Tu travailles dans le dépôt woodpecker-nextjs-backup. Réponds en français. Ne fais qu'une chose : faire délivrer GET /api/download/stems/[beatId] depuis la clé S3. Pas de commit. Ne modifie pas /api/download/beat/[beatId].

Fichier : src/app/api/download/stems/[beatId]/route.ts.

Garde : session obligatoire, résolution de l'utilisateur, contrôle d'achat prisma.multiItemOrder (statut PAID ou COMPLETED, licenseType TRACKOUT_LEASE ou UNLIMITED_LEASE sur ce beatId). Garde le JSON de succès { success: true, downloadUrl, expiresAt, beatTitle }.

Change la résolution du fichier :
- Ne bloque plus sur l'absence de beat.stemsUrl.
- Après le contrôle d'achat, charge s3StemsKey avec prisma.beat.findUnique({ where: { id: beatId }, select: { s3StemsKey: true, title: true } }). findUnique, pas BeatService.getBeatById, pour qu'un beat acheté puis passé inactif reste téléchargeable. C'est le même choix que la branche stems de src/app/api/download/beat/[beatId]/route.ts.
- Sans s3StemsKey → 404 { error: "Stems indisponibles" }.
- downloadUrl = await s3Service.generatePresignedDownloadUrl(s3StemsKey, 30 * 60). Import depuis @/lib/s3-service.
- expiresAt reste maintenant + 30 minutes. beatTitle vient du findUnique.

Supprime l'usage de CloudinaryService dans ce fichier s'il ne sert plus. Ne reconstruis pas un public_id depuis stemsUrl. N'ajoute pas de repli Cloudinary.
```

### Critères d'acceptation

- La route n'importe plus Cloudinary si plus aucun appel n'y reste.
- Un acheteur Trackout ou Unlimited avec `s3StemsKey` reçoit une URL signée S3.
- Sans `s3StemsKey`, la réponse est 404, même si `stemsUrl` est encore rempli.
- Le contrôle de commande et la forme JSON sont inchangés.
- `src/app/api/download/beat/[beatId]/route.ts` n'est pas modifié.

---

## Étape 7 — Vérification manuelle

### Objectif

Confirmer le flux sur un beat réel, publié puis planifié. Cette étape ne produit pas de code.

### Préalable

`pnpm run dev` tourne. Tu es connecté en admin. Tu as un petit ZIP de test et, si tu veux le chemin acheteur, une commande `PAID` ou `COMPLETED` en licence Trackout ou Unlimited sur le beat d'essai.

Note la clé S3 affichée sur la page avant chaque action (`s3StemsKey`). Dans la console AWS du bucket `AWS_S3_BUCKET_NAME`, le préfixe est `beats/stems/`.

### Ne pas faire

- Ne pas « corriger au passage » le master ou l'artwork.
- Ne pas committer.
- Ne pas ajouter de tests automatisés dans cette passe.

### Action

Fais la checklist toi-même. Si quelque chose échoue, ouvre un chat neuf et colle le prompt de rapport ci-dessous avec le numéro de cas et ce que tu as vu. Ce prompt demande un diagnostic, pas un correctif, tant que tu n'as pas dit de corriger.

### Checklist

Beat publié (`isActive: true`, pas de date future) qui a déjà un ZIP :

1. La page `/admin/beats/[id]/edit` montre la clé `s3StemsKey`, la poubelle, et le widget S3 avec le libellé de remplacement.
2. Poubelle. Le bandeau d'erreur reste vide. Après rafraîchissement, la section passe à l'état sans stems. En base, `stemsUrl`, `s3StemsUrl` et `s3StemsKey` sont `null`. L'objet de l'ancienne clé n'est plus dans le bucket. S'il reste, la base doit quand même être vide : c'est le cas « S3 a échoué après la base », à noter, pas à inverser.
3. Upload d'un ZIP via le widget (pas via « Enregistrer les fichiers »). La clé affichée change. `stemsUrl` et `s3StemsUrl` sont égales et correspondent à cette clé. L'ancienne clé n'est plus dans le bucket.
4. Deuxième remplacement. Même contrôles : nouvelle clé, les deux URL égales, ancienne clé absente.
5. Dans l'onglet réseau, le ZIP part vers S3 (URL signée ou `/api/s3/upload-proxy`), puis un `PUT /api/beats/[id]/stems` avec `{ url, key }`. Il n'y a pas de `PUT /api/beats/[id]/files` qui contient le ZIP.
6. Un `PUT /api/beats/[id]/files` fabriqué avec un champ `stems` répond 400 et ne crée pas d'objet.

Beat planifié (`isActive: false` ou `scheduledReleaseAt` dans le futur) :

7. La page s'ouvre.
8. La poubelle et le remplacement font la même chose qu'aux points 2 et 3, sans 404.

Erreurs visibles :

9. Une session non admin qui appelle `DELETE` ou `PUT /api/beats/[id]/stems` reçoit 403, et la page admin affiche le message dans le bandeau rouge si l'appel vient de l'UI.
10. Un fichier refusé par `S3Upload` (type ou taille) affiche l'erreur du widget.

Téléchargement, avec une commande éligible :

11. `GET /api/download/stems/[beatId]` renvoie `{ success, downloadUrl, expiresAt, beatTitle }` et `downloadUrl` est une URL signée du bucket, pas une URL Cloudinary.
12. `GET /api/download/beat/[beatId]` avec `type=stems`, `orderId` et `customerEmail` redirige encore vers une URL signée de la même clé.
13. Après la poubelle, les deux routes répondent que les stems sont indisponibles.

Catalogue :

14. Avec un ZIP attaché, les cartes qui testent `beat.stemsUrl` montrent encore les stems, parce que l'étape 4 a écrit `stemsUrl` en même temps que `s3StemsUrl`.
15. Après la poubelle, ces cartes ne montrent plus les stems.

### Prompt à coller si un cas échoue

```text
Tu travailles dans le dépôt woodpecker-nextjs-backup. Réponds en français. Ne modifie aucun fichier. Le runbook est docs/STEMS_EDIT_REMEDIATION.md. Les étapes 1 à 6 sont censées être faites.

Je viens de faire la vérification manuelle de l'étape 7. Voici le cas qui échoue, et ce que j'ai observé (réseau, message UI, colonnes en base, clé S3) :

CAS :
OBSERVATION :

Dis-moi quelle étape du runbook est en cause, quel fichier, et pourquoi ce cas contredit le contrat (s3StemsKey source de vérité, stemsUrl === s3StemsUrl, suppression base puis deleteFile best-effort, ZIP jamais bufferisé par /api/beats/[id]/files, admin + includeInactive). Ne propose un correctif qu'après ce diagnostic, et attends que je te dise de l'appliquer.
```

### Critères d'acceptation

- Les quinze cas ont été parcourus, ou les échecs sont notés avec le prompt de rapport.
- Aucun correctif « au feeling » n'a été mélangé à la vérification.
