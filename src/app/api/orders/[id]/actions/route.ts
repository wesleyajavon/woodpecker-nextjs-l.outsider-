import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body

    if (!id) {
      return NextResponse.json({ error: 'ID de la commande requis' }, { status: 400 })
    }

    if (!action) {
      return NextResponse.json({ error: 'Action requise' }, { status: 400 })
    }

    const exists = await prisma.multiItemOrder.findUnique({ where: { id }, select: { id: true } })
    if (!exists) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
    }

    let status: OrderStatus | null = null
    let message = ''

    switch (action) {
      case 'cancel':
        status = OrderStatus.CANCELLED
        message = 'Commande annulée avec succès'
        break
      case 'refund':
        status = OrderStatus.REFUNDED
        message = 'Commande remboursée avec succès'
        break
      case 'mark-paid':
        status = OrderStatus.PAID
        message = 'Statut de la commande mis à jour : PAYÉ'
        break
      case 'mark-completed':
        status = OrderStatus.COMPLETED
        message = 'Statut de la commande mis à jour : TERMINÉ'
        break
      default:
        return NextResponse.json(
          {
            error:
              'Action non reconnue. Actions disponibles: cancel, refund, mark-paid, mark-completed',
          },
          { status: 400 }
        )
    }

    const updated = await prisma.multiItemOrder.update({
      where: { id },
      data: {
        status,
        ...(status === OrderStatus.PAID ? { paidAt: new Date() } : {}),
      },
      include: {
        items: { include: { beat: true } },
      },
    })

    return NextResponse.json({
      success: true,
      message,
      data: updated,
    })
  } catch (error) {
    console.error("Erreur lors de l'exécution de l'action:", error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
