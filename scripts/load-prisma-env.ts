import { config } from 'dotenv'

/**
 * Même règle que scripts/prisma-env.mjs : charge .env puis .env.local
 * (override) pour que DATABASE_URL locale / dev l’emporte comme avec Next.js.
 * Si DATABASE_URL ou DIRECT_URL sont déjà fixées dans le shell, elles sont conservées.
 */
export function loadPrismaEnv(): void {
  const preservedDb = process.env.DATABASE_URL
  const preservedDirect = process.env.DIRECT_URL

  config({ path: '.env', quiet: true })
  config({ path: '.env.local', override: true, quiet: true })

  if (preservedDb !== undefined) process.env.DATABASE_URL = preservedDb
  if (preservedDirect !== undefined) process.env.DIRECT_URL = preservedDirect
}
