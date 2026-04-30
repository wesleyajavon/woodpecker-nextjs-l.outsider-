import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const totalOrders = await prisma.multiItemOrder.count()

    const totalRevenue = await prisma.multiItemOrder.aggregate({
      where: { status: { in: ['PAID', 'COMPLETED'] } },
      _sum: { totalAmount: true },
    })

    const pendingOrders = await prisma.multiItemOrder.count({
      where: { status: 'PENDING' },
    })

    const completedOrders = await prisma.multiItemOrder.count({
      where: { status: { in: ['PAID', 'COMPLETED'] } },
    })

    const monthlyRevenue = await prisma.multiItemOrder.groupBy({
      by: ['createdAt'],
      where: {
        status: { in: ['PAID', 'COMPLETED'] },
        createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      },
      _sum: { totalAmount: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount ? Number(totalRevenue._sum.totalAmount) : 0,
        pendingOrders,
        completedOrders,
        monthlyRevenue: monthlyRevenue.map((item) => ({
          ...item,
          _sum: {
            ...item._sum,
            totalAmount: item._sum.totalAmount ? Number(item._sum.totalAmount) : 0,
          },
        })),
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
