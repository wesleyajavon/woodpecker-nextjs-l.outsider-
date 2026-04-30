import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    paymentId: string
  }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { paymentId } = await params

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    const order = await prisma.multiItemOrder.findFirst({
      where: {
        OR: [{ paymentId }, { sessionId: paymentId }],
      },
      include: {
        items: {
          include: {
            beat: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error('Error fetching order by payment ID:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
