#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGET_USER_ID = 'cmf4axig300002g5s39lmzz2v'

async function main() {
  try {
    console.log('🔄 Linking existing beats to user...')
    
    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: TARGET_USER_ID }
    })
    
    if (!user) {
      console.error(`❌ User with ID ${TARGET_USER_ID} not found`)
      process.exit(1)
    }
    
    console.log(`✅ Found user: ${user.name || user.email}`)
    
    // Compter les beats existants
    const totalBeats = await prisma.beat.count()
    const beatsWithoutUser = await prisma.beat.count({
      where: { userId: null }
    })
    
    console.log(`📊 Total beats: ${totalBeats}`)
    console.log(`📊 Beats without user: ${beatsWithoutUser}`)
    
    if (beatsWithoutUser === 0) {
      console.log('✅ All beats are already linked to users')
      return
    }
    
    // Lier tous les beats sans utilisateur à l'utilisateur cible
    const result = await prisma.beat.updateMany({
      where: { userId: null },
      data: { userId: TARGET_USER_ID }
    })
    
    console.log(`✅ Successfully linked ${result.count} beats to user ${user.name || user.email}`)
    
    // Vérifier le résultat
    const beatsLinkedToUser = await prisma.beat.count({
      where: { userId: TARGET_USER_ID }
    })
    
    console.log(`📊 Beats now linked to user: ${beatsLinkedToUser}`)
    
    // Afficher quelques exemples de beats liés
    const sampleBeats = await prisma.beat.findMany({
      where: { userId: TARGET_USER_ID },
      take: 5,
      select: {
        id: true,
        title: true,
        genre: true,
        createdAt: true
      }
    })
    
    console.log('\n📋 Sample linked beats:')
    sampleBeats.forEach(beat => {
      console.log(`- ${beat.title} (${beat.genre}) - ${beat.createdAt.toISOString()}`)
    })
    
  } catch (error) {
    console.error('❌ Error linking beats to user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()












