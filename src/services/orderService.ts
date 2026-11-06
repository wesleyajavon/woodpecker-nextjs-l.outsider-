import { prisma } from '@/lib/prisma'

/** Resolve a NextAuth user from a checkout or Stripe email. */
export async function findUserIdByEmail(email: string | null | undefined): Promise<string | null> {
  const normalized = email?.trim()
  if (!normalized || normalized === 'pending@checkout.com') return null

  const user = await prisma.user.findFirst({
    where: { email: { equals: normalized, mode: 'insensitive' } },
    select: { id: true },
  })

  return user?.id ?? null
}

/** Customer has paid access to this beat via a completed multi-item (cart) order. */
export async function hasCustomerPurchasedBeat(customerEmail: string, beatId: string): Promise<boolean> {
  const multi = await prisma.multiItemOrder.findFirst({
    where: {
      customerEmail,
      status: { in: ['PAID', 'COMPLETED'] },
      items: { some: { beatId } },
    },
  })
  return !!multi
}
