import { PrismaClient } from '@prisma/client'
import { loadPrismaEnv } from './load-prisma-env'

loadPrismaEnv()

const prisma = new PrismaClient()

/** Attach historical orders to accounts when customerEmail matches User.email. */
async function linkOrdersToUsers() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true },
    })

    let linked = 0

    for (const user of users) {
      const result = await prisma.multiItemOrder.updateMany({
        where: {
          userId: null,
          customerEmail: { equals: user.email, mode: 'insensitive' },
        },
        data: { userId: user.id },
      })

      if (result.count > 0) {
        linked += result.count
        console.log(`${result.count} order(s) linked to ${user.email}`)
      }
    }

    console.log(`Done. ${linked} order(s) linked.`)
  } catch (error) {
    console.error('Error linking orders to users:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

linkOrdersToUsers()
