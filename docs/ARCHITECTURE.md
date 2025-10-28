# Architecture - Woodpecker Next.js

## Vue d’ensemble
- Frontend: Next.js 15 (App Router) + React 19 + TypeScript
- Backend: API Routes (route handlers) + Prisma ORM
- Base de données: PostgreSQL (Neon en production)
- Authentification: NextAuth.js (Email + OAuth)
- Paiements: Stripe (Checkout + Webhooks)
- Stockage: AWS S3 (fichiers audio) + Cloudinary (images)
- Cache/Rate limiting: Redis (Upstash)
- État: Zustand (UI) + TanStack Query (server state)

## Frontend (src/app)
- Routing App Router (`src/app/**`), pages serveur/clients.
- UI réutilisable dans `src/components/**` (cart, beats, admin, ui/).
- Thème et providers: `src/app/layout.tsx`, `src/providers/**`.
- Internationalisation simple via context/lang.

## Backend (API Routes)
- Endpoints REST sous `src/app/api/**` (orders, beats, admin, stripe, etc.).
- Handlers typés et sécurisés (auth, roles).
- Webhook Stripe: `src/app/api/stripe/webhook/route.ts` (paiements, refunds, disputes, multi-item orders).

## Données & Prisma
- Schéma Prisma: `prisma/schema.prisma`.
- Migrations versionnées: `prisma/migrations/**`.
- Déploiement prod: `scripts/deploy-prod-db.sh` (Neon, direct connection).
- Bonnes pratiques: `prisma migrate deploy` en prod, DB de prod distincte.

## Authentification (NextAuth)
- Providers configurables (Email, GitHub, Google).
- Sessions sécurisées, rôles: `USER`, `ADMIN`.
- Variables: voir `docs/NEXTAUTH_SETUP.md`.

## Paiements (Stripe)
- Checkout Sessions (single/multi items) + metadata licence.
- Webhooks gèrent: `checkout.session.completed`, refunds, disputes, etc.
- Docs: `docs/STRIPE_SETUP.md`, `docs/STRIPE_PRODUCTION_GUIDE.md`.

## Stockage (S3/Cloudinary)
- Audio (masters/stems) sur S3, images sur Cloudinary.
- Références stockées en DB (URLs/keys).
- Docs: `docs/CLOUDINARY.md`, `docs/docs/aws-s3-implementation.md`.

## Cache & Rate limiting (Redis)
- Upstash Redis pour cache (beats, stats) et protection endpoints.
- Config: voir docs cache.

## État applicatif
- Zustand: UI globale (cart, user, app UI state).
- TanStack Query: requêtes, cache serveur, invalidations.

## Observabilité & DX
- Logs structurés côté API.
- Scripts utilitaires: `scripts/**` (seed, check-db, stripe, etc.).
- Tests et guides: `docs/TESTING.md`.

## Variables d’environnement (clés principales)
- `DATABASE_URL` (Neon direct, sslmode=require)
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `CLOUDINARY_*`, `AWS_*`, `REDIS_*` (selon déploiement)

## Déploiement
- Hébergeur: Vercel (recommandé)
- Env prod configuré dans Vercel (jamais commité).
- Workflows: build Next.js, migrations Prisma manuelles (one-off).

---
Dernière mise à jour: Octobre 2025
