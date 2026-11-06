import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publicOrderBeatSelect, toPublicOrderBeat } from '@/lib/public-order-beat'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const multiItemOrder = await prisma.multiItemOrder.findFirst({
      where: { sessionId },
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

    if (multiItemOrder) {
      const data = {
        ...multiItemOrder,
        items: multiItemOrder.items.map((item) => ({
          ...item,
          beat: toPublicOrderBeat(item.beat),
        })),
      }

      return NextResponse.json({
        success: true,
        data,
        type: 'multi-item',
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Order not found',
      },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
