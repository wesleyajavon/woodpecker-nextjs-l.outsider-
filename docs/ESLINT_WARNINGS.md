# ESLint Warnings - Inventaire complet

Ce document liste toutes les warnings ESLint du projet, organisées par type et par fichier.
Référence : sortie de `pnpm run build` (Next.js 15.5.7).

---

## 1. @typescript-eslint/no-unused-vars

Variables, imports ou paramètres définis mais jamais utilisés.

### App (pages & routes)

| Fichier | Ligne | Variable/Import |
|---------|-------|------------------|
| `src/app/admin/beats/[id]/edit/page.tsx` | 12 | `Beat` |
| `src/app/admin/beats/[id]/page.tsx` | 69 | `result` |
| `src/app/admin/dashboard/page.tsx` | 4 | `Users`, `Loader2` |
| `src/app/admin/upload/page.tsx` | 21 | `error` |
| `src/app/auth/signin/page.tsx` | 39, 52 | `error` (x2) |
| `src/app/beats/[id]/page.tsx` | 6 | `Play`, `Pause`, `Download` |
| `src/app/beats/[id]/page.tsx` | 9 | `TextRewind` |
| `src/app/beats/[id]/page.tsx` | 20 | `router` |
| `src/app/beats/page.tsx` | 190 | `uniqueGenres` |
| `src/app/beats/page.tsx` | 192 | `stemsPercentage` |
| `src/app/cart/page.tsx` | 3 | `useEffect` |
| `src/app/contact/page.tsx` | 49 | `error` |
| `src/app/faq/page.tsx` | 7 | `ChevronUp` |
| `src/app/featured/page.tsx` | 5 | `Play`, `Pause` |
| `src/app/featured/page.tsx` | 15 | `t` |
| `src/app/licenses/page.tsx` | 17 | `Download` |
| `src/app/licenses/page.tsx` | 761 | `index` |
| `src/app/privacy/page.tsx` | 21, 22 | `Trash2`, `Download` |
| `src/app/privacy/page.tsx` | 66 | `getColorClasses` |
| `src/app/profile/page.tsx` | 28 | `router` |
| `src/app/success/page.tsx` | 7 | `Star` |
| `src/app/success/page.tsx` | 11 | `DownloadStemsButton` |

### API routes

| Fichier | Ligne | Variable/Import |
|---------|-------|------------------|
| `src/app/api/admin/cache/route.ts` | 4 | `getUserIdFromEmail` |
| `src/app/api/beats/upload/route.ts` | 2 | `validateUploadedFiles` |
| `src/app/api/beats/upload/route.ts` | 3 | `CLOUDINARY_FOLDERS` |
| `src/app/api/beats/upload/route.ts` | 21 | `UploadedFiles` |
| `src/app/api/cloudinary/upload/route.ts` | 4 | `CloudinaryService`, `CLOUDINARY_FOLDERS` |
| `src/app/api/cloudinary/upload-proxy/route.ts` | 4 | `CLOUDINARY_FOLDERS` |
| `src/app/api/cloudinary/upload-proxy/route.ts` | 21 | `beatId` |
| `src/app/api/download/stems/[beatId]/route.ts` | 3 | `OrderService` |
| `src/app/api/download/stems/[beatId]/route.ts` | 9 | `LicenseType` |
| `src/app/api/licenses/route.ts` | 148 | `language` |
| `src/app/api/orders/lookup/[sessionId]/route.ts` | 3 | `Order`, `MultiItemOrder` |
| `src/app/api/orders/multi/route.ts` | 6 | `request` |
| `src/app/api/privacy/route.ts` | 6 | `prisma` |
| `src/app/api/privacy/route.ts` | 157 | `language` |
| `src/app/api/s3/upload/route.ts` | 9 | `request` |
| `src/app/api/terms/route.ts` | 6 | `prisma` |
| `src/app/api/terms/route.ts` | 218 | `language` |
| `src/app/api/user/profile/route.ts` | 6 | `request` |

### Components

| Fichier | Ligne | Variable/Import |
|---------|-------|------------------|
| `src/components/AddToCartButton.tsx` | 5 | `Plus` |
| `src/components/AdminDropdown.tsx` | 97 | `index` |
| `src/components/AdminOrders.tsx` | 7 | `Filter` |
| `src/components/AdminOrders.tsx` | 53 | `error` |
| `src/components/AdminRoute.tsx` | 4 | `useState` |
| `src/components/AdminRoute.tsx` | 6 | `Loader2` |
| `src/components/AdminStats.tsx` | 3 | `useState`, `useEffect` |
| `src/components/AdminStats.tsx` | 5 | `TrendingUp` |
| `src/components/AdminStats.tsx` | 9 | `AdminStatsData` |
| `src/components/AuthButton.tsx` | 5, 6 | `Image`, `User` |
| `src/components/BeatCard.tsx` | 7 | `ShoppingCart`, `Star` |
| `src/components/BeatCard.tsx` | 11 | `BeatPricing` |
| `src/components/BeatCard.tsx` | 30 | `licenseIcons` |
| `src/components/BeatCard.tsx` | 85 | `handleLicenseSelect` |
| `src/components/BeatManager.tsx` | 6 | `Trash2` |
| `src/components/BeatManager.tsx` | 71 | `onEdit` |
| `src/components/BeatManager.tsx` | 269 | `handleDeleteBeat` |
| `src/components/BeatManager.tsx` | 292 | `togglePlay` |
| `src/components/BeatUpload.tsx` | 27 | `uploadProgress` |
| `src/components/BeatUpload.tsx` | 60 | `fileInputRefs` |
| `src/components/BeatUpload.tsx` | 280, 363 | `error` (x2) |
| `src/components/CloudinaryUpload.tsx` | 24 | `t` |
| `src/components/DownloadStemsButton.tsx` | 5 | `Download` |
| `src/components/FeaturedProducts.tsx` | 23 | `error` |
| `src/components/Hero.tsx` | 5 | `Music` |
| `src/components/LicenseSelector.tsx` | 3 | `useState` |
| `src/components/Navigation.tsx` | 6, 7, 12 | `User`, `ThemeToggle`, `AdminDropdown` |
| `src/components/NotificationContainer.tsx` | 3 | `useEffect` |
| `src/components/ResendEmailButton.tsx` | 53 | `error` |
| `src/components/S3Upload.tsx` | 4 | `FileAudio` |
| `src/components/TermsContent.tsx` | 14, 15 | `Eye`, `EyeOff` |
| `src/components/TermsContent.tsx` | 28 | `language` |
| `src/components/ThemeToggle.tsx` | 3 | `Sun` |
| `src/components/ThemeToggle.tsx` | 9 | `theme` |
| `src/components/UserMenu.tsx` | 7 | `Settings`, `ShoppingBag` |
| `src/components/admin/AdminSidebar.tsx` | 8, 17 | `Edit`, `Users` |
| `src/components/blocks/footer-section.tsx` | 5 | `FacebookIcon`, `LinkedinIcon` |
| `src/components/ui/BeatEditCard.tsx` | 3 | `useState` |
| `src/components/ui/BeatEditCard.tsx` | 18 | `cn` |
| `src/components/ui/BeatInfoCard.tsx` | 8, 12 | `Calendar`, `TrendingUp` |
| `src/components/ui/BeatInfoCard.tsx` | 60 | `isPlaying` |
| `src/components/ui/dotted-surface.tsx` | 41, 56, 210 | `e` (x3) |
| `src/components/ui/dotted-surface.tsx` | 91 | `particles` |
| `src/components/ui/floating-navbar.tsx` | 3 | `Link` |
| `src/components/ui/hover-border-gradient.tsx` | 2 | `useRef` |
| `src/components/ui/hover-border-gradient.tsx` | 69 | `event` |
| `src/components/ui/layout-text-flip.tsx` | 18 | `shadowColors` |
| `src/components/ui/text-rewind.tsx` | 41 | `noShadowStyle` |

### Hooks

| Fichier | Ligne | Variable/Import |
|---------|-------|------------------|
| `src/hooks/local/useLocalState.ts` | 1 | `useReducer` |
| `src/hooks/queries/useOrders.ts` | 1 | `useQueryClient` |
| `src/hooks/useCart.ts` | 5 | `Beat` |
| `src/hooks/useCartOptimized.ts` | 4 | `Beat` |
| `src/hooks/useCartZustand.ts` | 4 | `Beat` |

### Lib & Services

| Fichier | Ligne | Variable/Import |
|---------|-------|------------------|
| `src/lib/cloudinary.ts` | 233 | `options` |
| `src/lib/rate-limit.ts` | 143 | `request` |
| `src/lib/s3-service.ts` | 165 | `error` |
| `src/providers/AuthProvider.tsx` | 3 | `useEffect` |
| `src/services/cacheService.ts` | 198-203 | `faqKeys`, `licenseKeys`, `privacyKeys`, `beatKeys`, `userKeys`, `adminKeys` |
| `src/services/emailService.ts` | 38 | `customerName`, `totalAmount`, `currency`, `isMultiItem`, `beats`, `expiresAt` |
| `src/services/orderEmailService.ts` | 6 | `BeatDownloadUrls` |

---

## 2. react-hooks/exhaustive-deps

Problèmes de dépendances des hooks React (useEffect, useCallback, useMemo).

| Fichier | Ligne | Problème |
|---------|-------|----------|
| `src/app/beats/page.tsx` | 154 | useCallback : dépendance manquante `searchParams` |
| `src/app/beats/page.tsx` | 154 | useCallback : expression complexe dans le tableau de dépendances |
| `src/app/beats/page.tsx` | 185 | useEffect : `beats` peut changer les deps à chaque render → wrap dans useMemo |
| `src/app/beats/page.tsx` | 195 | useEffect : `togglePlay` change à chaque render → wrap dans useCallback |
| `src/app/profile/page.tsx` | 43 | useEffect : dépendance manquante `fetchUserProfile` |
| `src/components/AdminOrders.tsx` | 47 | useMemo : `orders` change à chaque render → déplacer dans le callback |
| `src/components/BeatManager.tsx` | 168 | useCallback : dépendance manquante `searchParams` |
| `src/components/BeatManager.tsx` | 168 | useCallback : expression complexe dans le tableau de dépendances |
| `src/components/ui/dotted-surface.tsx` | 207 | ref cleanup : copier `containerRef.current` dans une variable |
| `src/components/ui/hover-border-gradient.tsx` | 66 | useEffect : deps manquantes `duration`, `rotateDirection` |
| `src/components/ui/layout-text-flip.tsx` | 36 | useEffect : deps manquantes `duration`, `words.length` |
| `src/hooks/useCache.ts` | 124 | useCallback : spread dans le tableau de deps |

---

## 3. @next/next/no-img-element

Utilisation de `<img>` au lieu de `<Image />` de Next.js.

| Fichier | Ligne |
|---------|-------|
| `src/components/BeatCard.tsx` | 121 |
| `src/components/BeatManager.tsx` | 623 |
| `src/components/CartItem.tsx` | 63 |
| `src/components/ui/BeatEditCard.tsx` | 236 |
| `src/components/ui/BeatInfoCard.tsx` | 83 |

---

## 4. jsx-a11y/alt-text

Éléments `<img>` sans attribut `alt`.

| Fichier | Ligne |
|---------|-------|
| `src/components/BeatUpload.tsx` | 339 |
| `src/components/CloudinaryUpload.tsx` | 157 |
| `src/components/admin/AdminSidebar.tsx` | 322, 456 |
| `src/components/ui/BeatEditCard.tsx` | 215, 261, 416 |

---

## Résumé par type

| Type | Nombre |
|------|--------|
| @typescript-eslint/no-unused-vars | ~120 |
| react-hooks/exhaustive-deps | 12 |
| @next/next/no-img-element | 5 |
| jsx-a11y/alt-text | 6 |

---

*Généré à partir de la sortie ESLint du build Next.js.*
