import { NextRequest, NextResponse } from 'next/server'
import { createMultiItemCheckoutSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

const LICENSE_PRICE_FIELD = {
  WAV_LEASE: 'stripeWavPriceId',
  TRACKOUT_LEASE: 'stripeTrackoutPriceId',
  UNLIMITED_LEASE: 'stripeUnlimitedPriceId',
} as const

type CheckoutLicense = keyof typeof LICENSE_PRICE_FIELD

function isCheckoutLicense(value: unknown): value is CheckoutLicense {
  return value === 'WAV_LEASE' || value === 'TRACKOUT_LEASE' || value === 'UNLIMITED_LEASE'
}

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

    for (const item of items) {
      if (!item.beatId || !item.quantity || !item.beatTitle || !isCheckoutLicense(item.licenseType)) {
        return NextResponse.json(
          { error: 'Each item must have beatId, licenseType, quantity, and beatTitle' },
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

    const beatIds = [...new Set(items.map((item: { beatId: string }) => item.beatId))]
    const beats = await prisma.beat.findMany({
      where: { id: { in: beatIds } },
      select: {
        id: true,
        stripeWavPriceId: true,
        stripeTrackoutPriceId: true,
        stripeUnlimitedPriceId: true,
      },
    })
    const beatsById = new Map(beats.map((beat) => [beat.id, beat]))

    const resolvedItems: Array<{
      priceId: string
      quantity: number
      beatTitle: string
      licenseType: CheckoutLicense
      beatId: string
    }> = []

    for (const item of items) {
      const beat = beatsById.get(item.beatId)
      if (!beat) {
        return NextResponse.json(
          { error: 'Beat not found' },
          { status: 400 }
        )
      }

      const priceId = beat[LICENSE_PRICE_FIELD[item.licenseType as CheckoutLicense]]
      if (!priceId) {
        return NextResponse.json(
          { error: 'Stripe price is not configured for this license' },
          { status: 400 }
        )
      }

      resolvedItems.push({
        priceId,
        quantity: item.quantity,
        beatTitle: item.beatTitle,
        licenseType: item.licenseType,
        beatId: item.beatId,
      })
    }

    console.log('🔍 Multi-checkout API resolved items:', resolvedItems.map(({ priceId, ...rest }) => rest))

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
          create: resolvedItems.map(item => ({
            beatId: item.beatId,
            quantity: item.quantity,
            unitPrice: 0, // Sera calculé par le webhook
            totalPrice: 0, // Sera calculé par le webhook
            licenseType: item.licenseType
          }))
        }
      }
    })

    console.log('✅ Created PENDING multi-item order:', pendingOrder.id)

    // Create multi-item checkout session. priceId comes from the database, not the client.
    const session = await createMultiItemCheckoutSession(resolvedItems, successUrl, cancelUrl, pendingOrder.id)

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
