import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database schema...')
    
    // 1. Mettre à jour les valeurs NON_EXCLUSIVE vers WAV_LEASE
    console.log('📝 Skipping legacy Order table fixes (table removed)')
    
    // 2. Ajouter les nouveaux champs pour les priceId Stripe
    console.log('📝 Adding Stripe price ID columns...')
    
    await prisma.$executeRaw`
      ALTER TABLE "Beat" 
      ADD COLUMN IF NOT EXISTS "stripeWavPriceId" TEXT
    `
    
    await prisma.$executeRaw`
      ALTER TABLE "Beat" 
      ADD COLUMN IF NOT EXISTS "stripeTrackoutPriceId" TEXT
    `
    
    await prisma.$executeRaw`
      ALTER TABLE "Beat" 
      ADD COLUMN IF NOT EXISTS "stripeUnlimitedPriceId" TEXT
    `
    
    console.log('✅ Added Stripe price ID columns')
    
    console.log('🎉 Database schema fixed successfully!')
    
  } catch (error) {
    console.error('❌ Error fixing database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter la correction
fixDatabase()
