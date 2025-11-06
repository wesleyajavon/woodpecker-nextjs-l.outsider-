#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGET_USER_ID = 'cmf4axig300002g5s39lmzz2v'

async function main() {
  try {
    console.log('🔄 Setting user as admin...')
    
    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: TARGET_USER_ID }
    })
    
    if (!user) {
      console.error(`❌ User with ID ${TARGET_USER_ID} not found`)
      process.exit(1)
    }
    
    console.log(`✅ Found user: ${user.name || user.email}`)
    console.log(`📊 Current role: ${user.role}`)
    
    // Mettre à jour le rôle vers ADMIN
    const updatedUser = await prisma.user.update({
      where: { id: TARGET_USER_ID },
      data: { role: 'ADMIN' }
    })
    
    console.log(`✅ Successfully updated user role to: ${updatedUser.role}`)
    
    // Vérifier le résultat
    const finalUser = await prisma.user.findUnique({
      where: { id: TARGET_USER_ID },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    
    console.log('\n📋 Final user data:')
    console.log(`- ID: ${finalUser?.id}`)
    console.log(`- Name: ${finalUser?.name || 'N/A'}`)
    console.log(`- Email: ${finalUser?.email}`)
    console.log(`- Role: ${finalUser?.role}`)
    console.log(`- Created: ${finalUser?.createdAt.toISOString()}`)
    
  } catch (error) {
    console.error('❌ Error setting user as admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()












