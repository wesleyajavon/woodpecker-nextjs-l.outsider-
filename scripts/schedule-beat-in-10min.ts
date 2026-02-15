/**
 * Script pour tester la visibilité des beats planifiés SANS passer par le cron.
 *
 * Modifie un beat existant en base : met scheduledReleaseAt à "dans 10 minutes",
 * SANS toucher à isActive. Le beat devient visible automatiquement après 10 min
 * grâce au filtre de visibilité (scheduledReleaseAt <= now), pas besoin du cron.
 *
 * Usage: pnpm tsx scripts/schedule-beat-in-10min.ts
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const prisma = new PrismaClient()

const MINUTES_FROM_NOW = 10

async function main() {
  console.log('📅 Planification d\'un beat pour dans 10 minutes (sans toucher à isActive)\n')

  // Trouver un beat existant
  const beat = await prisma.beat.findFirst({
    select: { id: true, title: true, isActive: true, scheduledReleaseAt: true }
  })

  if (!beat) {
    console.error('❌ Aucun beat trouvé en base.')
    process.exit(1)
  }

  const releaseAt = new Date(Date.now() + MINUTES_FROM_NOW * 60 * 1000)

  // Modification directe en base : SEULEMENT scheduledReleaseAt, pas isActive
  await prisma.beat.update({
    where: { id: beat.id },
    data: { scheduledReleaseAt: releaseAt }
  })

  console.log(`✅ Beat modifié: "${beat.title}" (id: ${beat.id})`)
  console.log(`   → scheduledReleaseAt: ${releaseAt.toISOString()}`)
  console.log(`   → isActive: ${beat.isActive} (inchangé)`)
  console.log('')
  console.log('📋 Comportement attendu:')
  console.log(`   • Avant ${MINUTES_FROM_NOW} min : beat masqué (filtre scheduledReleaseAt > now)`)
  console.log(`   • Après ${MINUTES_FROM_NOW} min : beat visible (scheduledReleaseAt <= now)`)
  console.log('   • Pas besoin du cron : la visibilité est gérée par le filtre des requêtes.')
  console.log('')
  console.log(`⏰ Vérifie dans ~${MINUTES_FROM_NOW} minutes sur /beats ou l'API publique.`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
