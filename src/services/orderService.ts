import { prisma } from '@/lib/prisma'

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
