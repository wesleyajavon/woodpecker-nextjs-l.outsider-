/**
 * Exécute la logique du cron "activate-scheduled-beats" en local.
 *
 * Active les beats où :
 *   - scheduledReleaseAt <= now
 *   - isActive = false
 *
 * Utile pour tester sans attendre le cron Vercel (qui tourne à minuit UTC).
 * Pas besoin de serveur : utilise Prisma directement.
 *
 * Usage: pnpm run cron:activate-beats
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const prisma = new PrismaClient()

async function main() {
  const now = new Date()
  console.log('⏰ Activation des beats planifiés (logique cron)\n')
  console.log(`   Heure (UTC): ${now.toISOString()}\n`)

  const result = await prisma.beat.updateMany({
    where: {
      scheduledReleaseAt: { not: null, lte: now },
      isActive: false
    },
    data: { isActive: true }
  })

  if (result.count === 0) {
    console.log('   Aucun beat à activer (tous déjà actifs ou date future).\n')
    return
  }

  console.log(`   ✅ ${result.count} beat(s) activé(s). Ils sont maintenant visibles publiquement.\n`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
