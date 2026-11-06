# Masters et stems accessibles sans payer

Runbook du chantier urgent relevé le 6 novembre 2026. `GET /api/beats` est public et renvoie, pour chaque prod, `fullUrl`, `s3MasterUrl`, `stemsUrl`, `s3StemsUrl`, `s3MasterKey` et `s3StemsKey`. Ces URL pointent vers le bucket `loutsider-beats-storage-wesley-ajavon` et répondent 200 sans authentification. Un `HEAD` sur Négocier ce jour-là a confirmé le WAV (30 Mo) et le ZIP de stems (235 Mo). Les mêmes champs sortent de `GET /api/beats/[id]`.

Les prods à publication planifiée n'apparaissent pas dans l'API avant leur date de sortie. Ce filtre reste en place.

Chaque étape est un chat séparé. Colle le prompt, ou fais l'action manuelle, attends que les critères d'acceptation soient vrais, puis passe à la suivante.

L'ordre ci-dessous retire d'abord les URL du JSON, confirme que l'acheteur passe par un lien signé, puis ferme le bucket. Fermer le bucket avant cette confirmation couperait le téléchargement des clients qui ont déjà payé.

Coche au fur et à mesure :

- [ ] Étape 1 — Réponse publique sans fichiers ni identifiants Stripe
- [ ] Étape 2 — Lien signé à chaque clic, selon la licence
- [ ] Étape 3 — Email et pages d'achat sur ces liens
- [ ] Étape 4 — Bucket S3 privé
- [ ] Étape 5 — Anciennes URL en clair

## Où sont les données

PostgreSQL ne garde que des pointeurs. Les octets sont sur S3.

| Rôle | Détail |
| --- | --- |
| Bucket | `loutsider-beats-storage-wesley-ajavon` (`AWS_S3_BUCKET_NAME`) |
| Lecture signée | `s3Service.generatePresignedDownloadUrl` dans `src/lib/s3-service.ts` (`getSignedUrl` du SDK AWS) |
| URL publique | `S3_CONFIG.getPublicUrl` dans `src/lib/aws-s3.ts` |
| Sérialisation | `BeatService.convertPrismaBeat` dans `src/services/beatService.ts` étale l'objet Prisma entier |

`GET /api/beats` (`src/app/api/beats/route.ts`) et `GET /api/beats/[id]` (`src/app/api/beats/[id]/route.ts`) renvoient ce beat converti. `GET /api/beats/featured` et `GET /api/beats/genre/[genre]` passent par le même service. `GET /api/orders/lookup/[sessionId]` sélectionne encore `fullUrl` et `stemsUrl`.

Le front public traite `stemsUrl` comme un booléen « cette prod a des stems » : `src/components/catalog/CatalogBeatCard.tsx`, `src/components/BeatCard.tsx`, `src/components/home/HomeFeaturedBeatCard.tsx`, `src/components/CartItem.tsx`, `src/components/LicenseSelector.tsx`, `src/app/beats/[id]/page.tsx`, `src/app/featured/page.tsx`.

L'admin charge `GET /api/beats/[id]` via `useBeat` (`src/app/admin/beats/[id]/page.tsx`, `src/app/admin/beats/[id]/edit/page.tsx`) et lit `s3MasterUrl`, `s3MasterKey`, `s3StemsUrl`, `s3StemsKey`.

Le téléchargement acheteur existe déjà : `GET /api/download/beat/[beatId]` vérifie la commande, puis redirige vers une URL signée de 30 minutes. L'email (`src/services/orderEmailService.ts`) pointe le master vers cette route, et les stems vers `GET /api/download/stems/[beatId]`. La FAQ (`src/app/faq/page 2.tsx`) annonce des liens valables 30 jours. Le texte de la page succès parle de 30 minutes, ce qui correspond à la durée de la signature S3, pas à la durée pendant laquelle le client peut redemander un lien.

## Contrat

- La réponse publique d'un beat ne contient aucune URL ni clé de master ou de stems, aucun `stripe*PriceId`, aucun `userId`.
- Le catalogue sait encore qu'une prod a des stems, via un booléen calculé côté serveur.
- Une session admin sur `GET /api/beats/[id]` garde les champs fichier, parce que l'édition en a besoin.
- Le bucket n'autorise plus `s3:GetObject` au public. Le master et les stems ne sortent que par `generatePresignedDownloadUrl`.
- Le lien signé n'est pas stocké. Il est créé au clic. La signature reste courte (30 minutes, comme aujourd'hui). Le client peut en redemander un pendant 30 jours après le paiement, comme l'annonce la FAQ.
- Les stems signés ne partent que pour `TRACKOUT_LEASE` et `UNLIMITED_LEASE`.
- Les beats planifiés restent absents de l'API publique avant leur date.

## Hors scope

- Les cinq autres chantiers de la revue du 6 novembre 2026.
- Une rotation des clés AWS, une suppression d'objets, un changement de région ou de nom de bucket.
- Le filtre de publication planifiée.
- L'upload admin (`src/components/S3Upload.tsx`, `POST /api/beats/upload`, `PUT /api/beats/[id]/files`).
- Un commit git, sauf demande explicite dans le chat.

## Comment utiliser un prompt

Ouvre un chat neuf sur ce dépôt. Colle le bloc tel quel. Le prompt dit de ne traiter que cette étape. À la fin, vérifie les critères d'acceptation avant de continuer.

---

## Étape 1 — Réponse publique

### Objectif

Le JSON public ne permet plus de retrouver le WAV ni le ZIP. Le catalogue affiche toujours le badge stems.

### Fichiers

- `src/services/beatService.ts` (`convertPrismaBeat`, `getBeats`, `getBeatById`, `getFeaturedBeats`)
- `src/app/api/beats/route.ts`
- `src/app/api/beats/[id]/route.ts`
- `src/app/api/beats/featured/route.ts`
- `src/app/api/beats/genre/[genre]/route.ts`
- `src/app/api/orders/lookup/[sessionId]/route.ts`
- `src/types/beat.ts`
- Composants publics qui lisent `beat.stemsUrl` comme un drapeau (liste dans « Où sont les données »)

### Ne pas faire

- Ne pas enlever les colonnes Prisma, ni les champs du type utilisé par l'admin et par l'upload.
- Ne pas retirer `s3MasterUrl`, `s3StemsUrl`, `s3MasterKey`, `s3StemsKey` de la réponse quand l'appelant de `GET /api/beats/[id]` est un admin. L'édition en dépend.
- Ne pas remplacer `stemsUrl` par rien : le front s'en sert pour savoir si les stems existent. Ajouter `hasStems` sur la réponse publique, calculé à partir de `s3StemsKey` ou `stemsUrl`, puis brancher le front public dessus.
- Ne pas toucher au filtre des beats planifiés.
- Ne pas rendre le bucket privé dans ce chat.
- Ne pas committer.

### Prompt à coller

```text
Tu travailles dans le dépôt woodpecker-nextjs-backup. Réponds en français. Ne fais qu'une chose : la réponse JSON publique des beats ne doit plus contenir les fichiers master/stems ni les identifiants Stripe. Lis docs/PUBLIC_MASTERS_STEMS_REMEDIATION.md, section Étape 1, et suis-la. Pas de changement S3, pas de commit.

Contexte. BeatService.convertPrismaBeat dans src/services/beatService.ts étale l'enregistrement Prisma. GET /api/beats, GET /api/beats/[id], GET /api/beats/featured et GET /api/beats/genre/[genre] renvoient donc fullUrl, s3MasterUrl, stemsUrl, s3StemsUrl, s3MasterKey, s3StemsKey, les stripe*PriceId et userId. GET /api/orders/lookup/[sessionId] sélectionne fullUrl et stemsUrl. Le front public utilise stemsUrl seulement comme booléen « a des stems ». L'admin charge GET /api/beats/[id] (useBeat) et a besoin des champs S3 pour l'édition.

À faire.

1. Introduis une fonction de vue publique, à côté de convertPrismaBeat, qui ne renvoie que : id, title, description, genre, bpm, key, mode, duration, wavLeasePrice, trackoutLeasePrice, unlimitedLeasePrice, tags, previewUrl, artworkUrl, featured, isExclusive, rating, reviewCount, hasStems, createdAt. hasStems vaut true si s3StemsKey ou stemsUrl est non nul. Aucun de ces champs : fullUrl, s3MasterUrl, stemsUrl, s3StemsUrl, s3MasterKey, s3StemsKey, stripePriceId, stripeWavPriceId, stripeTrackoutPriceId, stripeUnlimitedPriceId, userId.

2. Branche cette vue sur GET /api/beats, GET /api/beats/featured, GET /api/beats/genre/[genre], et sur GET /api/beats/[id] lorsque l'appelant n'est pas admin. Si l'appelant est admin (session + isUserAdmin, comme la route le fait déjà), garde l'objet complet actuel pour ne pas casser src/app/admin/beats/[id]/edit/page.tsx.

3. Retire fullUrl et stemsUrl du select de GET /api/orders/lookup/[sessionId]. Si l'UI succès a besoin du drapeau stems, renvoie hasStems à la place.

4. Remplace, dans les composants du catalogue public listés dans le document, les lectures de beat.stemsUrl par beat.hasStems. Ne change pas BeatEditCard ni les pages admin, qui lisent s3StemsUrl.

5. Laisse le filtre des beats planifiés tel quel.

Vérifie dans le navigateur le catalogue, la fiche beat, la home featured et le sélecteur de licence : le badge stems s'affiche encore sur une prod qui en a, et disparaît sur une prod qui n'en a pas. Dans l'onglet réseau, la réponse de GET /api/beats ne contient aucune des clés interdites.
```

### Critères d'acceptation

- Une requête sans session sur `GET /api/beats` et `GET /api/beats/[id]` ne contient aucune clé de la liste interdite, et contient `hasStems`.
- La même requête avec une session admin sur `GET /api/beats/[id]` contient encore `s3MasterKey` et `s3StemsKey`.
- `GET /api/beats/featured`, `GET /api/beats/genre/[genre]` et `GET /api/orders/lookup/[sessionId]` suivent la même règle publique.
- Le badge stems du catalogue suit `hasStems`.
- L'édition admin affiche toujours le master et le ZIP.
- Un beat dont `scheduledReleaseAt` est dans le futur reste absent de `GET /api/beats`.

---

## Étape 2 — Lien signé à chaque clic

### Objectif

Après paiement, le WAV et, selon la licence, les stems s'obtiennent par une URL signée créée au moment du clic. Rien n'est stocké.

### Fichiers

- `src/app/api/download/beat/[beatId]/route.ts`
- `src/app/api/download/stems/[beatId]/route.ts`
- `src/services/orderEmailService.ts`
- `src/lib/s3-service.ts` (`generatePresignedDownloadUrl`)
- La page succès et le texte qui parle d'expiration (`src/lib/translations/fr.ts`, clé `downloadLinksReady`)

### Ne pas faire

- Ne pas écrire l'URL signée en base, dans l'email, ou dans la réponse de `POST /api/download/beat/[beatId]`. L'email et le POST continuent de pointer vers la route de l'application. C'est le `GET` de cette route qui signe.
- Ne pas passer `expiresIn` à 30 jours. Trente jours est la période pendant laquelle le client peut redemander un lien. La signature S3 reste de 30 minutes.
- Ne pas signer les stems pour `WAV_LEASE`.
- Ne pas rendre le bucket privé dans ce chat.
- Ne pas committer.

### Prompt à coller

```text
Tu travailles dans le dépôt woodpecker-nextjs-backup. Réponds en français. Ne fais qu'une chose : le téléchargement payant signe le fichier S3 au clic, selon la licence. Lis docs/PUBLIC_MASTERS_STEMS_REMEDIATION.md, section Étape 2, et suis-la. Pas de changement de bucket, pas de commit.

Contexte. GET /api/download/beat/[beatId] vérifie déjà la commande (orderId + customerEmail), puis appelle s3Service.generatePresignedDownloadUrl pour 30 minutes sur s3MasterKey ou s3StemsKey, et redirige. Le POST de la même route renvoie des URL vers cette route, pas des URL S3. L'email (src/services/orderEmailService.ts) fait pareil pour le master, mais envoie les stems vers GET /api/download/stems/[beatId]. La FAQ annonce 30 jours. Le texte downloadLinksReady dit 30 minutes.

À faire.

1. Garde la signature à 30 minutes dans generatePresignedDownloadUrl. N'enregistre pas l'URL signée.

2. Sur le GET client de /api/download/beat/[beatId], type=stems : refuse avec 403 si licenseType n'est pas TRACKOUT_LEASE ou UNLIMITED_LEASE. Le master reste disponible pour les trois licences, tant que la commande contient ce beat.

3. Refuse un téléchargement dont la commande a plus de 30 jours (date de paiement de la commande). Réponse 403 avec un message qui dit de contacter le support, comme la FAQ.

4. Fais pointer les stems de l'email vers /api/download/beat/[beatId]?type=stems avec les mêmes orderId et customerEmail, et seulement si la licence est TRACKOUT_LEASE ou UNLIMITED_LEASE. Ne passe plus par /api/download/stems/[beatId] depuis l'email.

5. Laisse le texte « 30 minutes » pour le lien qui vient d'être généré. Il décrit la signature, pas les 30 jours.

Vérifie avec une commande de test : WAV_LEASE obtient le master et un 403 sur type=stems ; TRACKOUT_LEASE obtient les deux ; l'URL de redirection est une URL signée du SDK (paramètre de signature), pas l'URL publique du bucket.
```

### Critères d'acceptation

- Le `GET` client répond par une redirection vers une URL signée, durée 30 minutes.
- `type=stems` sans licence trackout ou unlimited répond 403.
- Une commande de plus de 30 jours répond 403.
- L'email de confirmation ne contient pas le nom d'hôte du bucket, et son lien stems contient `type=stems` sur `/api/download/beat/`.
- Aucune colonne nouvelle ne stocke d'URL signée.

---

## Étape 3 — Email et espace achats

### Objectif

Chaque endroit où l'acheteur récupère ses fichiers passe par la route de l'étape 2.

### Fichiers

- `src/services/orderEmailService.ts` et le template appelé par `emailService.sendOrderConfirmationEmail`
- `src/app/success/page.tsx`
- `src/app/api/orders/lookup/[sessionId]/route.ts`
- `src/app/api/download/multi-order/[orderId]/route.ts`
- Le profil et tout écran « mes achats » s'il existe (`src/app/profile/page.tsx`, liens commentés vers `/orders` dans `src/components/UserMenu.tsx`)

### Ne pas faire

- Ne pas créer une page « Mes achats » si elle n'existe pas. Signale son absence dans le compte-rendu et arrête-toi aux écrans qui existent.
- Ne pas remettre `fullUrl` ou `stemsUrl` dans une réponse JSON.
- Ne pas committer.

### Prompt à coller

```text
Tu travailles dans le dépôt woodpecker-nextjs-backup. Réponds en français. Ne fais qu'une chose : vérifier, et corriger si besoin, que l'email de confirmation et les écrans d'achat ouvrent le master et les stems via GET /api/download/beat/[beatId]. Lis docs/PUBLIC_MASTERS_STEMS_REMEDIATION.md, section Étape 3, et suis-la. Pas de page nouvelle, pas de commit.

Contexte. L'étape 2 signe au clic sur cette route. L'email est construit dans src/services/orderEmailService.ts. La page succès charge GET /api/orders/lookup/[sessionId]. src/app/api/download/multi-order/[orderId]/route.ts construit aussi des URL de téléchargement. La FAQ parle d'un accès depuis le profil ; UserMenu a un lien /orders commenté. Il n'y a peut-être pas d'écran « Mes achats ».

À faire.

1. Cherche chaque construction d'URL de master ou de stems côté acheteur (email, page succès, lookup, multi-order, profil). Le lien doit être /api/download/beat/{beatId}?orderId=...&customerEmail=...&type=master ou type=stems.

2. Si un lien contient le bucket, fullUrl, s3MasterUrl, stemsUrl ou s3StemsUrl, remplace-le par la route d'application. Les stems restent conditionnés à TRACKOUT_LEASE ou UNLIMITED_LEASE.

3. S'il n'existe pas de page « Mes achats », ne la crée pas. Écris-le dans le compte-rendu.

4. Parcours dans le navigateur la page succès d'une commande de test et déclenche le téléchargement master. Le réseau doit montrer la route /api/download/beat/, puis une redirection signée.

Ne modifie pas la politique du bucket.
```

### Critères d'acceptation

- L'email, la page succès et la route multi-order ne contiennent aucune URL du bucket.
- Un clic master sur la page succès télécharge via la route signée.
- Le compte-rendu dit si une page « Mes achats » existe, et lequel écran a été vérifié.

---

## Étape 4 — Bucket privé

### Objectif

Bloquer la lecture anonyme du bucket. Les URL déjà copiées cessent de répondre.

### Action manuelle (console AWS, région du bucket)

À faire seulement quand les critères de l'étape 2 sont vrais. Un agent dans le dépôt ne peut pas changer le compte AWS.

1. S3 → bucket `loutsider-beats-storage-wesley-ajavon` → Permissions → Block Public Access : activer les quatre cases.
2. Bucket policy : retirer toute instruction qui autorise `s3:GetObject` (ou `s3:*`) pour `Principal: "*"`. Garder les instructions qui concernent le compte ou le rôle utilisé par les clés de l'application, sinon l'upload admin et `getSignedUrl` cassent.
3. Confirmer que les ACL d'objet sont désactivées. Le code d'upload ne pose déjà plus d'ACL (`src/lib/s3-service.ts`).
4. Ne pas supprimer d'objets, ne pas changer les clés d'accès, ne pas renommer le bucket.

### Prompt à coller après l'action AWS

```text
Tu travailles dans le dépôt woodpecker-nextjs-backup. Réponds en français. Ne fais qu'une chose : constater que le bucket est privé et que le téléchargement payant marche encore. Lis docs/PUBLIC_MASTERS_STEMS_REMEDIATION.md, section Étape 4. Ne modifie aucun fichier, ne commit pas.

1. HEAD sur l'ancienne URL publique d'un master (fullUrl ou s3MasterUrl d'une prod, par exemple Négocier) et d'un ZIP stems. Les deux doivent répondre 403.

2. Avec une commande de test de moins de 30 jours, ouvre GET /api/download/beat/{beatId}?orderId=...&customerEmail=...&type=master. La redirection signée doit répondre 200.

3. Confirme que l'upload admin signe toujours son PUT (GET /api/s3/upload) et qu'aucune route publique ne reconstruit une URL via S3_CONFIG.getPublicUrl pour la renvoyer au navigateur d'un visiteur.

S'il manque une policy et que l'upload ou le lien signé échoue, décris l'instruction à remettre. Ne l'invente pas dans le code.
```

### Critères d'acceptation

- Block Public Access est actif sur les quatre réglages.
- La bucket policy n'a plus de lecture pour `Principal: "*"`.
- `HEAD` d'une ancienne URL master et d'une ancienne URL stems : 403.
- Le lien signé d'une commande valide : 200.
- L'upload admin obtient encore une URL de PUT signée.

---

## Étape 5 — Anciennes URL

### Objectif

Constater que les URL copiées avant la fermeture ne sont plus utilisables. Aucun code.

### Action

1. Reprendre l'URL exacte utilisée pour le test du 6 novembre 2026 (WAV et ZIP de Négocier, ou une autre prod dont l'URL a été notée).
2. `HEAD` ou ouverture dans un navigateur privé : 403.
3. Rien d'autre. Pas d'invalidation, pas de réécriture des colonnes `fullUrl` / `stemsUrl` : elles ne sont plus une porte d'entrée une fois le bucket privé, et l'admin s'en sert encore comme pointeur.

### Critères d'acceptation

- L'URL en clair du WAV et celle du ZIP répondent 403 sans cookie de session.
- Aucun fichier du dépôt n'a changé pendant cette étape.
