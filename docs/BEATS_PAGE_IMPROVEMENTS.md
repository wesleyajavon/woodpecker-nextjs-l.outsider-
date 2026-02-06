# Améliorations de la page Beats – Roadmap et prompts

Ce document liste les améliorations à apporter à la page `/beats` selon les bonnes pratiques du secteur. Les éléments sont classés par priorité (du plus important au moins critique).

---

## État actuel (déjà implémenté)

| Élément | Statut |
|---------|--------|
| Recherche texte | ✅ |
| Filtre par genre | ✅ |
| Pagination | ✅ |
| Items par page (4/8/12/24) | ✅ |
| Vue grille / liste | ✅ |
| Loading state | ✅ |
| Error state + retry | ✅ |
| Empty state + reset filters | ✅ |
| Preview audio play/pause | ✅ |
| Un seul beat en lecture à la fois | ✅ |
| CTA "Beat sur mesure" | ✅ |
| i18n | ✅ |
| Responsive + touch targets | ✅ |
| Page détail beat `/beats/[id]` | ✅ |
| API supporte BPM, Key, Price, sort | ✅ (non exposé en UI) |

---

## Priorité 1 – Critique (SEO, conversion, UX)

### 1.1 Metadata SEO pour la page Beats

**Problème :** Pas de metadata spécifique pour `/beats` (title, description, Open Graph).

**Prompt :**
```
Add metadata (title, description, Open Graph) for the beats catalog page at src/app/beats/page.tsx.
Since it's a client component, create a layout.tsx in src/app/beats/ that exports metadata with:
- title: "Beats | l.outsider - Catalogue de beats professionnels"
- description: descriptive text for SEO
- openGraph with title, description, url
Use the existing i18n/translation system if metadata can be localized, otherwise keep it in French.
```

---

### 1.2 Lien BeatCard vers la page détail

**Problème :** Les BeatCards ne sont pas cliquables pour accéder à la page détail. Pas de lien SEO vers `/beats/[id]`.

**Prompt :**
```
In BeatCard component (src/components/BeatCard.tsx), wrap the card content (or the artwork/title area) with a Next.js Link to /beats/[beat.id].
- The card should remain clickable to navigate to the beat detail page
- The play button and add to cart button should NOT trigger navigation (use stopPropagation or separate click handlers)
- Ensure the link has proper aria-label for accessibility
- The artwork and title should be the primary click target for navigation
```

---

### 1.3 Synchronisation des filtres avec l’URL (searchParams)

**Problème :** Les filtres (search, genre, page, sort) ne sont pas dans l’URL. Impossible de partager un lien filtré ou d’utiliser le bouton retour.

**Prompt :**
```
Sync the beats page filters with URL search params in src/app/beats/page.tsx:
- Use useSearchParams and useRouter from next/navigation
- Read on mount: search, genre, page, limit, sortBy from URL
- Update URL when user changes search, genre, page, itemsPerPage, or sort (without full page reload)
- Pass these values to useBeats hook
- Ensure the page works when user lands with URL like /beats?genre=Trap&page=2&sortBy=price_asc
- Reset to page 1 when search, genre, or sort changes
```

---

### 1.4 Sélecteur de tri (Sort)

**Problème :** Le tri est fixé à `newest`. L’API et `useBeats` supportent déjà `newest`, `oldest`, `price_asc`, `price_desc`, `popular`.

**Prompt :**
```
Add a sort dropdown to the beats page filters section (src/app/beats/page.tsx).
- Options: Plus récents (newest), Plus anciens (oldest), Prix croissant (price_asc), Prix décroissant (price_desc), Populaires (popular)
- Pass the selected value to useBeats({ sortBy: ... })
- Add translations for sort options in the i18n files
- Place it next to the genre filter and items-per-page selector
- If URL sync is implemented, sortBy should be in the URL
```

---

## Priorité 2 – Important (UX, performance)

### 2.1 Debounce sur la recherche

**Problème :** Chaque frappe déclenche une requête API immédiatement.

**Prompt :**
```
Add debounce (300-400ms) to the search input on the beats page (src/app/beats/page.tsx).
- Use a local state for the input value (instant feedback)
- Use a debounced value for the actual API call (useBeats)
- You can use a custom hook useDebounce or lodash debounce
- Ensure the debounced search is passed to useBeats, not the raw input
```

---

### 2.2 Indicateur des filtres actifs + bouton "Réinitialiser" visible

**Problème :** Pas d’indication visuelle des filtres actifs. Le bouton reset n’apparaît que dans l’empty state.

**Prompt :**
```
On the beats page, when any filter is active (search non-empty, genre other than "all", or non-default sort):
- Show a small badge/chip indicating active filters count or list (e.g. "2 filtres actifs")
- Display a "Réinitialiser les filtres" button in the filters bar (always visible when filters are active)
- Use the existing handleResetFilters function
- Style it consistently with the rest of the UI
```

---

### 2.3 Filtres avancés : BPM, Key, Prix, Stems

**Problème :** L’API supporte `bpmMin`, `bpmMax`, `key`, `priceMin`, `priceMax` mais l’UI ne les expose pas.

**Prompt :**
```
Add advanced filters to the beats page. The API already supports: bpmMin, bpmMax, key, priceMin, priceMax.
- Add BPM range: two number inputs (min/max) or a range slider, using BEAT_CONFIG.bpmRanges for hints
- Add Key filter: dropdown with BEAT_CONFIG.keys + "Toutes" option
- Add Price range: min/max inputs (optional, can be collapsible "Plus de filtres")
- Add "Avec stems" checkbox: filter beats that have stemsUrl. **Note:** The API does not yet support a `stems`/`hasStems` param. You will need to: (1) add `hasStems?: boolean` to BeatFilters in src/types/beat.ts, (2) add the param in src/app/api/beats/route.ts, (3) update BeatService.getBeats to filter by stemsUrl when hasStems is true
- Extend useBeats (src/hooks/queries/useBeats.ts) to accept bpmMin, bpmMax, key, hasStems and pass them as query params to the API
- If URL sync exists, add these to searchParams
- Consider a "Filtres avancés" collapsible section on mobile to avoid clutter
```

---

### 2.4 Skeleton loaders au lieu du spinner

**Problème :** Un simple spinner pendant le chargement, moins informatif qu’un skeleton.

**Prompt :**
```
Replace the loading spinner on the beats page with skeleton loaders that mimic the BeatCard layout.
- Create a BeatCardSkeleton component (or inline skeletons) with placeholder blocks for: artwork (square), title, genre, BPM/Key, price area, button
- Show a grid of 8 skeleton cards (responsive: 1 col mobile, 2-4 cols desktop) during loading
- Use animate-pulse from Tailwind
- Keep the same grid structure as the actual beat cards
```

---

## Priorité 3 – Recommandé (accessibilité, SEO avancé)

### 3.1 Breadcrumb

**Problème :** Pas de fil d’Ariane.

**Prompt :**
```
Add a breadcrumb to the beats page: Accueil > Beats
- Place it at the top of the content, before the main title
- Use semantic nav with aria-label="Fil d'Ariane"
- Link "Accueil" to / and "Beats" as current page (span, not link)
- Add translations for "Accueil" and "Beats" if needed
- Style it subtly (muted text, small font)
```

---

### 3.2 Schema.org (MusicRecording / Product)

**Problème :** Pas de données structurées pour les moteurs de recherche.

**Prompt :**
```
Add JSON-LD structured data for the beats catalog page.
- Create a component or function that outputs MusicRecording schema for each beat (or Product if more appropriate)
- Include: name, description, image, audio (preview URL), genre, duration, offers (price)
- For the catalog page, you can output an ItemList with ListItem for each beat
- Inject via a script tag in the page or using next/script
- This can be in a separate component e.g. BeatsStructuredData that receives the beats array
```

---

### 3.3 Accessibilité : aria-live pour les mises à jour dynamiques

**Problème :** Les mises à jour (résultats, pagination) ne sont pas annoncées aux lecteurs d’écran.

**Prompt :**
```
Add aria-live region for dynamic content updates on the beats page:
- Wrap the results count text ("Showing X to Y of Z results") in a div with aria-live="polite" and aria-atomic="true"
- When filters change and new results load, screen readers will announce the update
- Ensure the region is not empty on initial load (use a default message or the loading state)
```

---

### 3.4 Raccourci clavier Espace pour play/pause

**Problème :** Pas de raccourci clavier pour contrôler la lecture.

**Prompt :**
```
Add keyboard shortcut: when user presses Space and focus is on a BeatCard (or when the playing beat card is in view), toggle play/pause.
- Use a useEffect with keydown listener
- Only trigger when: (1) a beat is playing, or (2) the focused element is within a BeatCard
- Prevent default to avoid page scroll when Space is pressed
- Consider focus management: when playing, focus could move to the playing card's pause button
```

---

## Priorité 4 – Nice to have

### 4.1 Barre de progression / waveform pour le preview

**Prompt :**
```
Add a progress bar or waveform visualization to the BeatCard preview player.
- Show current time / total duration (e.g. 0:15 / 0:30)
- Clickable progress bar to seek (if preview allows)
- Optional: use a library like wavesurfer.js for waveform, or a simple linear progress bar with Tailwind
```

---

### 4.2 Labels accessibles sur les inputs

**Prompt :**
```
Ensure all filter inputs (search, genre, sort, items per page) have proper labels:
- Use <label> with htmlFor linked to input id, or
- Use aria-label on the input if the label is purely visual
- The search input should have aria-label="Rechercher des beats"
- Select elements should have visible or sr-only labels
```

---

### 4.3 Badges "Nouveau" / "Populaire"

**Prompt :**
```
Add optional badges to BeatCard: "Nouveau" (created in last 7 days) and "Populaire" (if you have a plays/sales metric).
- Check if the Beat type has createdAt or similar
- Add small badge in corner of artwork, similar to the stems badge
- Style distinctly (e.g. green for Nouveau, orange for Populaire)
```

---

## Ordre d’implémentation suggéré

1. **1.2** – Lien BeatCard → détail (rapide, fort impact SEO/UX)
2. **1.1** – Metadata SEO (rapide)
3. **1.4** – Sélecteur de tri (l’API est prête)
4. **1.3** – URL sync (plus de travail, mais très utile)
5. **2.1** – Debounce recherche
6. **2.2** – Indicateur filtres actifs
7. **2.4** – Skeleton loaders
8. **2.3** – Filtres avancés (BPM, Key, Prix)
9. **3.1** – Breadcrumb
10. **3.2** – Schema.org
11. **3.3** – aria-live
12. **3.4** – Raccourci Espace
13. **4.x** – Éléments nice to have

---

## Fichiers principaux à modifier

| Fichier | Modifications prévues |
|---------|------------------------|
| `src/app/beats/page.tsx` | URL sync, sort, debounce, filtres actifs, skeletons, breadcrumb, aria-live |
| `src/app/beats/layout.tsx` | À créer – metadata |
| `src/components/BeatCard.tsx` | Link vers détail, stopPropagation sur boutons |
| `src/hooks/queries/useBeats.ts` | Déjà prêt pour sort, BPM, Key, Price |
| `src/app/api/beats/route.ts` | Vérifier support `stems` si filtre stems ajouté |
| Fichiers i18n | Nouvelles clés pour sort, breadcrumb, etc. |

---

*Dernière mise à jour : Février 2025*
