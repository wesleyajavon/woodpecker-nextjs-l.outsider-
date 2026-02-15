# Publication planifiée des beats – Guide d’implémentation

Ce document consolide tous les prompts et instructions pour implémenter la fonctionnalité de **publication planifiée** des beats. Chaque prompt est conçu pour être exécuté **dans l’ordre indiqué**.

---

## Contexte de la fonctionnalité

Lors de l’upload d’un beat, l’admin peut définir une date/heure de publication. Le beat reste masqué jusqu’à ce moment, puis devient automatiquement visible dans l’app.

**Fichiers principaux concernés :**
- `prisma/schema.prisma` – modèle Beat
- `src/types/beat.ts` – types TypeScript
- `src/services/beatService.ts` – logique métier
- `src/app/api/beats/upload/route.ts` – API d’upload
- `src/components/BeatUpload.tsx` – formulaire d’upload admin

**Stack :** Next.js 15, Prisma, PostgreSQL, TypeScript, Vercel

---

## Choix d’architecture : avec ou sans cron

### Option A : Avec cron (recommandé)

- Le beat est créé avec `isActive: false` si la date est future.
- Un cron job (toutes les 5 min) met `isActive = true` quand `scheduledReleaseAt` est dépassé.
- **Avantage :** `isActive` reflète directement la visibilité ; logique simple.
- **Inconvénient :** Nécessite la config Vercel Cron.

### Option B : Sans cron

- Le beat reste `isActive: true` dès la création.
- La visibilité est gérée uniquement par le filtre dans les requêtes :  
  `(scheduledReleaseAt IS NULL OR scheduledReleaseAt <= now)`.
- **Avantage :** Pas de tâche planifiée, plus simple à déployer.
- **Inconvénient :** Le filtre doit être appliqué **partout** où des beats sont listés ou affichés publiquement. Un oubli = fuite d’un beat planifié.

### Où appliquer le filtre (approche sans cron)

| Méthode / Endpoint | Fichier | Si oublié |
|--------------------|---------|------------|
| `getBeats` | `beatService.ts` | Liste principale `/beats` |
| `getFeaturedBeats` | `beatService.ts` | Page d’accueil, featured |
| `getBeatsByGenre` | `beatService.ts` | `/api/beats/genre/[genre]` |
| `getBeatById` | `beatService.ts` | Accès direct `/beats/[id]` par URL |

---

## Prompt 1 : Schéma base de données

> Add a new optional field `scheduledReleaseAt` of type `DateTime` to the Beat model in the Prisma schema (`prisma/schema.prisma`). This field should be nullable (optional). Create and run a migration for this change. The field will store the date/time when a beat should automatically become visible to users. Store dates in UTC. Optionally add an index on this field for query performance.

---

## Prompt 2 : Types TypeScript

> Update the Beat interface and CreateBeatInput/UpdateBeatInput types in `src/types/beat.ts` to include an optional `scheduledReleaseAt` field of type `Date | null`. Ensure it's properly typed for both reading and writing.

---

## Prompt 3 : BeatService – création et visibilité

> In `BeatService` (`src/services/beatService.ts`):
> 1. Update `createBeat` to accept an optional `scheduledReleaseAt` parameter. When `scheduledReleaseAt` is set and is in the future, set `isActive` to `false`; otherwise use the default `true`. (Skip this step if using Option B – sans cron.)
> 2. Update `getBeats`, `getFeaturedBeats`, `getBeatsByGenre`, and `getBeatById` so that beats with `scheduledReleaseAt` in the future are excluded from public results. A beat is only visible if: `(isActive AND (scheduledReleaseAt is null OR scheduledReleaseAt <= now))`. Apply this in the Prisma `where` clause.
> 3. Ensure admin views can still see scheduled beats (e.g. via `includeInactive` or similar parameter) so admins can manage them before release.

---

## Prompt 4 : API d’upload – accepter la date planifiée

> Update the beat upload API route (`src/app/api/beats/upload/route.ts`) to accept an optional `scheduledReleaseAt` field from the form data. Parse it as an ISO 8601 datetime string and pass it to the beat creation logic. Validate that the date is in the future if provided; if it's in the past, treat it as "release immediately" (set to null or ignore).

---

## Prompt 5 : Formulaire d’upload – champ date/heure

> Add an optional "Scheduled release date/time" field to the BeatUpload component (`src/components/BeatUpload.tsx`). Use a datetime-local input or a proper date-time picker component. The field should:
> - Be optional (admin can leave it empty for immediate release)
> - Show a clear label like "Release at (optional)" or "Publication planifiée (optionnel)"
> - Send the value as ISO 8601 string in the form data as `scheduledReleaseAt`
> - Validate that if provided, the date is in the future
> - Use the admin's local timezone for display, but store in UTC

---

## Prompt 6 : Édition de beat – modifier la date planifiée

> Add the ability to view and edit `scheduledReleaseAt` when editing an existing beat. Update the beat edit page/component (`src/app/admin/beats/[id]/edit/page.tsx` or related components) and the beat update API (`PUT /api/beats/[id]`) to support changing or clearing the scheduled release time. Ensure admins can set, update, or remove the scheduled release date on existing beats.

---

## Prompt 7 : Cron job – activation automatique (Option A uniquement)

> Implement a scheduled task (cron job) that runs periodically (e.g. every 5 minutes) and:
> 1. Finds all beats where `scheduledReleaseAt` is not null AND `scheduledReleaseAt <= now()` AND `isActive` is false
> 2. Sets `isActive = true` for those beats
> 3. Optionally set `scheduledReleaseAt = null` after activation to avoid re-processing, or leave it for audit purposes
>
> Use Vercel Cron Jobs (add to `vercel.json`). Create an API route at `src/app/api/cron/activate-scheduled-beats/route.ts`. Secure the route with a CRON_SECRET or Vercel's cron authentication. Document how to configure the cron in Vercel dashboard.

---

## Prompt 8 : Admin UI – indicateur de statut planifié

> In the admin beat list and beat detail views (BeatManager, etc.), show a clear indicator when a beat has a scheduled release. Display the scheduled date/time and a badge or label like "Scheduled for [date]" or "Publication prévue le [date]". This helps admins see which beats are pending release at a glance.

---

## Prompt 9 : Traductions

> Add translation keys for the scheduled release feature in `src/lib/translations/` (en.ts, fr.ts, etc.): labels for "Scheduled release", "Release at (optional)", "Scheduled for [date]", "Releases at [date]", and any validation messages. Update all supported language files.

---

## Prompt 10 : Vérification des endpoints publics

> Verify that all endpoints returning beats to public users apply the `scheduledReleaseAt` filter: `GET /api/beats`, `GET /api/beats/featured`, `GET /api/beats/genre/[genre]`, `GET /api/beats/[id]`. Admin endpoints (`/api/admin/beats`) should include scheduled beats via `includeInactive`.

---

## Prompt 11 : Tests et cas limites

> Add or update tests for the scheduled release feature:
> 1. Creating a beat with `scheduledReleaseAt` in the future → beat is not visible in public API
> 2. Creating a beat with `scheduledReleaseAt` in the past or null → beat is visible immediately
> 3. (Option A) Cron job correctly activates beats when `scheduledReleaseAt` passes
> 4. Admin views can see scheduled beats before they go live
>
> Also handle edge cases: timezone handling (store in UTC), invalid dates, idempotency for concurrent cron runs (Option A).

---

## Checklist de mise en œuvre

- [ ] Prompt 1 : Schéma DB + migration
- [ ] Prompt 2 : Types TypeScript
- [ ] Prompt 3 : BeatService (création + visibilité)
- [ ] Prompt 4 : API upload
- [ ] Prompt 5 : Formulaire d’upload
- [ ] Prompt 6 : Édition de beat
- [ ] Prompt 7 : Cron job (si Option A)
- [ ] Prompt 8 : Indicateurs admin
- [ ] Prompt 9 : Traductions
- [ ] Prompt 10 : Vérification endpoints
- [ ] Prompt 11 : Tests

---

## Notes techniques

- **Timezone :** Stocker toutes les dates en UTC. Convertir en timezone locale uniquement dans l’UI.
- **Fréquence du cron (Option A) :** Toutes les 5 minutes est généralement suffisant.
---

## Configuration Vercel Cron (Option A – détail)

### 1. Fichier `vercel.json`

Ajouter la clé `crons` à la racine de la config (à côté de `functions`, `headers`, etc.) :

```json
{
  "crons": [
    {
      "path": "/api/cron/activate-scheduled-beats",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

- **`path`** : route API à appeler (doit commencer par `/`)
- **`schedule`** : expression cron en UTC. Ce projet est configuré pour le **plan Hobby** : `0 0 * * *` = 1 exécution par jour à minuit UTC (limite du plan gratuit). Pour une fréquence toutes les 5 minutes (`*/5 * * * *`), un plan Pro (ou supérieur) est requis.

### 2. Variable d'environnement `CRON_SECRET`

1. Dans le dashboard Vercel : **Project → Settings → Environment Variables**
2. Ajouter une variable :
   - **Name :** `CRON_SECRET`
   - **Value :** chaîne aléatoire d'au moins 16 caractères (ex. générateur 1Password)
   - **Environments :** Production (et éventuellement Preview si besoin)

Vercel envoie automatiquement cette valeur dans l'en-tête `Authorization: Bearer <CRON_SECRET>` lors de chaque invocation. La route API doit la vérifier.

### 3. Vérification dans la route API

Exemple de vérification dans `src/app/api/cron/activate-scheduled-beats/route.ts` :

```ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  // ... logique d'activation des beats
}
```

### 4. Dashboard Vercel

Après déploiement, les cron jobs apparaissent dans :
- **Dashboard → Projet → Cron Jobs** (ou **Settings → Cron Jobs** selon la version)

On peut y consulter les logs et l'état des exécutions. Les cron jobs ne s'exécutent que sur les déploiements **production**.

### 5. Test local

**Option A – Via l’API (serveur dev requis) :**

```bash
curl -H "Authorization: Bearer VOTRE_CRON_SECRET" http://localhost:3000/api/cron/activate-scheduled-beats
```

**Option B – Script local (sans serveur) :**

```bash
pnpm run cron:activate-beats
```

Ce script exécute la même logique que le cron via Prisma, sans démarrer Next.js.

### 6. Scripts de diagnostic et test

| Script | Usage | Description |
|--------|-------|-------------|
| `pnpm run diagnose:scheduled-beats` | Diagnostic | Liste les beats avec `scheduledReleaseAt` et leur statut (visible/masqué, en attente du cron) |
| `pnpm run cron:activate-beats` | Test | Active manuellement les beats dont la date est dépassée (équivalent au cron) |
| `pnpm run schedule-beat-10min` | Test | Planifie un beat pour dans 10 min (sans toucher `isActive`) |

### 7. Dépannage : « Un beat a une date passée mais n’est pas visible »

Un beat est visible si **les deux** conditions sont remplies :
- `isActive = true`
- `scheduledReleaseAt` est null OU dans le passé

Si un beat a `scheduledReleaseAt` dans le passé mais `isActive = false`, il attend le cron pour être activé. Avec le schedule `0 0 * * *` (minuit UTC), le cron ne tourne qu’une fois par jour.

**Solution immédiate :** exécuter `pnpm run cron:activate-beats` pour activer manuellement les beats en attente.

### Références

- [Vercel Cron Jobs – Documentation](https://vercel.com/docs/cron-jobs)
- [Managing Cron Jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs)
