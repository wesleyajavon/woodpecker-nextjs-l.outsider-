/**
 * Diagnostic : liste tous les beats avec scheduledReleaseAt et leur statut de visibilité.
 *
 * Un beat est visible publiquement si :
 *   isActive = true ET (scheduledReleaseAt est null OU scheduledReleaseAt <= now)
 *
 * Les beats avec scheduledReleaseAt dans le passé et isActive = false doivent être
 * activés par le cron. Si le cron n'a pas encore tourné, ils restent masqués.
 *
 * Usage: pnpm run diagnose:scheduled-beats
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const prisma = new PrismaClient()

function isVisible(beat: { isActive: boolean; scheduledReleaseAt: Date | null }): boolean {
  if (!beat.isActive) return false
  if (beat.scheduledReleaseAt === null) return true
  return beat.scheduledReleaseAt <= new Date()
}

function needsCronActivation(beat: { isActive: boolean; scheduledReleaseAt: Date | null }): boolean {
  return beat.isActive === false && beat.scheduledReleaseAt !== null && beat.scheduledReleaseAt <= new Date()
}

async function main() {
  const now = new Date()
  console.log('🔍 Diagnostic des beats planifiés\n')
  console.log(`   Heure actuelle (UTC): ${now.toISOString()}\n`)

  const allBeats = await prisma.beat.findMany({
    where: { scheduledReleaseAt: { not: null } },
    select: { id: true, title: true, isActive: true, scheduledReleaseAt: true },
    orderBy: { scheduledReleaseAt: 'asc' }
  })

  if (allBeats.length === 0) {
    console.log('   Aucun beat avec scheduledReleaseAt.\n')
    return
  }

  const needsCron = allBeats.filter(needsCronActivation)
  const visible = allBeats.filter(isVisible)

  console.log(`   Total: ${allBeats.length} beat(s) avec scheduledReleaseAt\n`)

  for (const beat of allBeats) {
    const vis = isVisible(beat) ? '✅ visible' : '❌ masqué'
    const past = beat.scheduledReleaseAt && beat.scheduledReleaseAt <= now ? 'passé' : 'futur'
    const status = needsCronActivation(beat) ? ' → en attente du cron' : ''
    console.log(`   • ${beat.id}`)
    console.log(`     titre: "${beat.title}" | isActive: ${beat.isActive} | date: ${beat.scheduledReleaseAt?.toISOString() ?? 'null'} (${past})`)
    console.log(`     ${vis}${status}\n`)
  }

  if (needsCron.length > 0) {
    console.log(`   ⚠️  ${needsCron.length} beat(s) en attente du cron : scheduledReleaseAt passé + isActive=false`)
    console.log('      → Exécute "pnpm run cron:activate-beats" pour les activer manuellement.\n')
  }

  console.log(`   Visible publiquement : ${visible.length}/${allBeats.length}\n`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
