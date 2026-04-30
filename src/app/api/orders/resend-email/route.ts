import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail } from '@/services/orderEmailService'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerEmail } = await request.json()

    if (!orderId || !customerEmail) {
      return NextResponse.json(
        { error: 'Order ID and customer email are required' },
        { status: 400 }
      )
    }

    const order = await prisma.multiItemOrder.findFirst({
      where: {
        id: orderId,
        customerEmail: customerEmail,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 })
    }

    await sendOrderConfirmationEmail(orderId, customerEmail)

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent successfully',
    })
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 })
  }
}
