import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
              select: {
                id: true,
                title: true,
                genre: true,
                bpm: true,
                key: true,
                duration: true,
                wavLeasePrice: true,
                trackoutLeasePrice: true,
                unlimitedLeasePrice: true,
                isExclusive: true,
                featured: true,
                fullUrl: true,
                stemsUrl: true,
                artworkUrl: true,
              },
            },
          },
        },
      },
    })

    if (multiItemOrder) {
      return NextResponse.json({
        success: true,
        data: multiItemOrder,
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
