import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const USER_ID = 'cmln8qjnw0000275p5civxntr'

async function linkBeatsToUser() {
  try {
    console.log('🔗 Linking all beats to user:', USER_ID)

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: USER_ID },
    })

    if (!user) {
      console.error('❌ User not found with id:', USER_ID)
      process.exit(1)
    }

    console.log(`✅ User found: ${user.email} (${user.name ?? 'No name'})`)

    // Update all beats to link to this user
    const result = await prisma.beat.updateMany({
      where: {},
      data: { userId: USER_ID },
    })

    console.log(`\n🎉 Done! ${result.count} beat(s) linked to user ${user.email}`)
  } catch (error) {
    console.error('❌ Error linking beats:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

linkBeatsToUser()
