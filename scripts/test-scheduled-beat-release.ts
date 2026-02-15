/**
 * Script de test pour la publication planifiée des beats (cron activate-scheduled-beats).
 *
 * Étapes :
 * 1. Crée ou modifie un beat avec scheduledReleaseAt dans le passé et isActive = false
 * 2. Appelle la route du cron
 * 3. Vérifie que le beat a bien isActive = true
 *
 * Usage: pnpm run test:scheduled-release
 * Prérequis: CRON_SECRET dans .env.local, serveur dev sur localhost:3000
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'

// Charger .env.local en priorité (comme Next.js)
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const prisma = new PrismaClient()

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

async function main() {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || cronSecret.length < 16) {
    console.error('❌ CRON_SECRET manquant ou trop court (min 16 caractères). Vérifiez .env.local')
    process.exit(1)
  }

  console.log('🧪 Test de la publication planifiée des beats\n')

  // Étape 1 : Créer ou modifier un beat de test
  let beatId: string
  const pastDate = new Date(Date.now() - 60 * 1000) // 1 minute dans le passé

  const existingBeat = await prisma.beat.findFirst({
    select: { id: true, title: true }
  })

  if (existingBeat) {
    // Modifier un beat existant
    await prisma.beat.update({
      where: { id: existingBeat.id },
      data: {
        isActive: false,
        scheduledReleaseAt: pastDate
      }
    })
    beatId = existingBeat.id
    console.log(`📝 Beat existant modifié: "${existingBeat.title}" (id: ${beatId})`)
    console.log(`   → isActive: false, scheduledReleaseAt: ${pastDate.toISOString()}\n`)
  } else {
    // Créer un nouveau beat de test
    const beat = await prisma.beat.create({
      data: {
        title: '[TEST] Beat planifié - à supprimer',
        description: 'Beat créé par le script test-scheduled-release.ts',
        genre: 'Trap',
        bpm: 140,
        key: 'C#',
        mode: 'mineur',
        duration: '3:24',
        wavLeasePrice: 19.99,
        trackoutLeasePrice: 39.99,
        unlimitedLeasePrice: 79.99,
        tags: ['Test', 'Scheduled'],
        isActive: false,
        scheduledReleaseAt: pastDate
      }
    })
    beatId = beat.id
    console.log(`📝 Beat de test créé: "${beat.title}" (id: ${beatId})`)
    console.log(`   → isActive: false, scheduledReleaseAt: ${pastDate.toISOString()}\n`)
  }

  // Étape 2 : Appeler la route du cron
  console.log('⏳ Appel de la route cron...')
  const response = await fetch(`${BASE_URL}/api/cron/activate-scheduled-beats`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${cronSecret}`
    }
  })

  const body = await response.json()

  if (!response.ok) {
    console.error('❌ Erreur API:', response.status, body)
    process.exit(1)
  }

  console.log('✅ Réponse cron:', body)
  if (body.activatedCount < 1) {
    console.warn('⚠️  Aucun beat activé. Vérifiez que scheduledReleaseAt est bien dans le passé.')
  }

  // Étape 3 : Vérifier le résultat
  const beatAfter = await prisma.beat.findUnique({
    where: { id: beatId },
    select: { id: true, title: true, isActive: true, scheduledReleaseAt: true }
  })

  if (!beatAfter) {
    console.error('❌ Beat introuvable après le cron')
    process.exit(1)
  }

  if (beatAfter.isActive) {
    console.log('\n✅ Succès ! Le beat a bien isActive = true')
    console.log(`   → ${beatAfter.title} (id: ${beatAfter.id})`)
  } else {
    console.error('\n❌ Échec : le beat a toujours isActive = false')
    console.error('   Vérifiez la logique du cron ou que scheduledReleaseAt <= now')
    process.exit(1)
  }

  console.log('\n🎉 Test terminé avec succès.')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
