import { NextRequest, NextResponse } from 'next/server'
import { createMultiItemCheckoutSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  console.log('🚀 Multi-checkout API called')
  try {
    const { items, successUrl, cancelUrl } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required and must not be empty' },
        { status: 400 }
      )
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Success URL and Cancel URL are required' },
        { status: 400 }
      )
    }

    // Validate each item
    for (const item of items) {
      if (!item.priceId || !item.quantity || !item.beatTitle) {
        return NextResponse.json(
          { error: 'Each item must have priceId, quantity, and beatTitle' },
          { status: 400 }
        )
      }
      
      if (item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Quantity must be greater than 0' },
          { status: 400 }
        )
      }
    }

    console.log('🔍 Multi-checkout API received items:', items)

    // Créer une commande multi-items PENDING avant la session Stripe
    const pendingOrder = await prisma.multiItemOrder.create({
      data: {
        customerEmail: 'pending@checkout.com', // Sera mis à jour par le webhook
        totalAmount: 0, // Sera calculé par le webhook
        currency: 'EUR',
        paymentMethod: 'card',
        sessionId: 'pending', // Sera mis à jour par le webhook
        status: OrderStatus.PENDING,
        items: {
          create: items.map(item => ({
            beatId: item.beatId || 'unknown', // Il faut ajouter beatId dans les items
            quantity: item.quantity,
            unitPrice: 0, // Sera calculé par le webhook
            totalPrice: 0, // Sera calculé par le webhook
            licenseType: item.licenseType || 'WAV_LEASE'
          }))
        }
      }
    })

    console.log('✅ Created PENDING multi-item order:', pendingOrder.id)

    // Create multi-item checkout session
    const session = await createMultiItemCheckoutSession(items, successUrl, cancelUrl, pendingOrder.id)

    // Update order with real Stripe session ID so success page lookup works
    await prisma.multiItemOrder.update({
      where: { id: pendingOrder.id },
      data: { sessionId: session.id }
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })

  } catch (error) {
    console.error('Error creating multi-item checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
