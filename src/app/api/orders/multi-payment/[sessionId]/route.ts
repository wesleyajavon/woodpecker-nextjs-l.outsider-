import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { publicOrderBeatSelect, toPublicOrderBeat } from '@/lib/public-order-beat'
import { MultiItemOrder, OrderStatus, LicenseType } from '@/types/order'

interface OrderItemWithPartialBeat {
  id: string
  orderId: string
  beatId: string
  beat: {
    id: string
    title: string
    genre: string
    bpm: number
    key: string
    duration: string
    wavLeasePrice: unknown // Prisma Decimal type
    trackoutLeasePrice: unknown // Prisma Decimal type
    unlimitedLeasePrice: unknown // Prisma Decimal type
    isExclusive: boolean
    featured: boolean
    artworkUrl: string | null
    hasStems: boolean
  }
  quantity: number
  unitPrice: number
  totalPrice: number
  licenseType: LicenseType
  createdAt: Date
  updatedAt: Date
}

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Find the multi-item order by session ID
    const order = await prisma.multiItemOrder.findFirst({
      where: {
        sessionId: sessionId,
      },
      include: {
        items: {
          include: {
            beat: {
              select: publicOrderBeatSelect,
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Convert to MultiItemOrder type with partial beat data
    const multiItemOrder: Omit<MultiItemOrder, 'items'> & { items: OrderItemWithPartialBeat[] } = {
      id: order.id,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      status: order.status as OrderStatus,
      paymentMethod: order.paymentMethod,
      paymentId: order.paymentId,
      paidAt: order.paidAt,
      usageRights: order.usageRights,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id,
        orderId: item.orderId,
        beatId: item.beatId,
        beat: toPublicOrderBeat(item.beat),
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        licenseType: item.licenseType,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      sessionId: order.sessionId || undefined,
    }

    return NextResponse.json({
      success: true,
      data: multiItemOrder
    })

  } catch (error) {
    console.error('Error fetching multi-item order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
