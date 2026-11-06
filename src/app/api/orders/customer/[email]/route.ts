import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publicOrderBeatSelect, toPublicOrderBeat } from '@/lib/public-order-beat'

interface RouteParams {
  params: Promise<{
    email: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { email } = await params
    const decodedEmail = decodeURIComponent(email)

    if (!decodedEmail) {
      return NextResponse.json({ error: 'Email du client requis' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(decodedEmail)) {
      return NextResponse.json({ error: "Format d'email invalide" }, { status: 400 })
    }

    const orders = await prisma.multiItemOrder.findMany({
      where: { customerEmail: decodedEmail },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            beat: {
              select: publicOrderBeatSelect,
            },
          },
        },
      },
    })

    const data = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        beat: toPublicOrderBeat(item.beat),
      })),
    }))

    return NextResponse.json({
      success: true,
      data,
      customerEmail: decodedEmail,
      count: orders.length,
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes du client:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
