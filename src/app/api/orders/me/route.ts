import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { OrderStatus } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { publicOrderBeatSelect, toPublicOrderBeat } from '@/lib/public-order-beat'
import type { MyOrder, MyOrdersSummary } from '@/types/order'

const PAID_STATUSES = new Set<OrderStatus>([OrderStatus.PAID, OrderStatus.COMPLETED])

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: session.user.email, mode: 'insensitive' } },
      select: { id: true, email: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const orders = await prisma.multiItemOrder.findMany({
      where: {
        OR: [
          { userId: user.id },
          { customerEmail: { equals: user.email, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            beat: { select: publicOrderBeatSelect },
          },
        },
      },
    })

    const data: MyOrder[] = orders.map((order) => ({
      id: order.id,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      status: order.status,
      paidAt: order.paidAt?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        beatId: item.beatId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        licenseType: item.licenseType,
        beat: toPublicOrderBeat(item.beat),
      })),
    }))

    return NextResponse.json({ orders: data, summary: buildSummary(data) })
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes utilisateur:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

function buildSummary(orders: MyOrder[]): MyOrdersSummary {
  const byStatus: Record<string, number> = {}
  const byLicense: Record<string, number> = {}
  const spent = new Map<string, number>()
  let paidCount = 0
  let beatsPurchased = 0
  let lastPaidAt: string | null = null

  for (const order of orders) {
    byStatus[order.status] = (byStatus[order.status] ?? 0) + 1
    if (!PAID_STATUSES.has(order.status)) continue

    paidCount += 1
    const stamp = order.paidAt ?? order.createdAt
    if (!lastPaidAt || stamp > lastPaidAt) lastPaidAt = stamp
    spent.set(order.currency, (spent.get(order.currency) ?? 0) + order.totalAmount)

    for (const item of order.items) {
      beatsPurchased += item.quantity
      byLicense[item.licenseType] = (byLicense[item.licenseType] ?? 0) + item.quantity
    }
  }

  const spentByCurrency = [...spent.entries()].map(([currency, amount]) => ({
    currency,
    amount: Math.round(amount * 100) / 100,
  }))
  const singleCurrency = spentByCurrency.length === 1 ? spentByCurrency[0] : null

  return {
    orderCount: orders.length,
    paidCount,
    totalSpent: singleCurrency?.amount ?? (spentByCurrency.length === 0 ? 0 : null),
    currency: singleCurrency?.currency ?? (spentByCurrency.length === 0 ? 'EUR' : null),
    spentByCurrency,
    beatsPurchased,
    byLicense,
    byStatus,
    lastPaidAt,
  }
}
