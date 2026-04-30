import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'
import type { MultiItemOrder, LicenseType } from '@/types/order'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID de la commande requis' }, { status: 400 })
    }

    const order = await prisma.multiItemOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            beat: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
    }

    const data: MultiItemOrder = {
      id: order.id,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      status: order.status as MultiItemOrder['status'],
      paymentMethod: order.paymentMethod,
      paymentId: order.paymentId,
      paidAt: order.paidAt,
      usageRights: order.usageRights,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      sessionId: order.sessionId ?? undefined,
      items: order.items.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        beatId: item.beatId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        licenseType: item.licenseType as LicenseType,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        beat: {
          ...item.beat,
          wavLeasePrice: Number(item.beat.wavLeasePrice),
          trackoutLeasePrice: Number(item.beat.trackoutLeasePrice),
          unlimitedLeasePrice: Number(item.beat.unlimitedLeasePrice),
        },
      })),
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID de la commande requis' }, { status: 400 })
    }

    const exists = await prisma.multiItemOrder.findUnique({ where: { id }, select: { id: true } })
    if (!exists) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
    }

    const updated = await prisma.multiItemOrder.update({
      where: { id },
      data: {
        ...(body.customerName !== undefined && { customerName: body.customerName }),
        ...(body.customerPhone !== undefined && { customerPhone: body.customerPhone }),
        ...(body.status !== undefined && { status: body.status as OrderStatus }),
        ...(body.paymentMethod !== undefined && { paymentMethod: body.paymentMethod }),
        ...(body.paymentId !== undefined && { paymentId: body.paymentId }),
      },
      include: {
        items: {
          include: {
            beat: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Commande mise à jour avec succès',
      data: updated,
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
