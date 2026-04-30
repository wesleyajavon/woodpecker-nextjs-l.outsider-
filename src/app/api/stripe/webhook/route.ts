import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { BeatService } from '@/services/beatService'
import { sendOrderConfirmationEmail } from '@/services/orderEmailService'
import { PrismaClient, OrderStatus } from '@prisma/client'
import { LicenseType } from '@/types/cart'
import Stripe from 'stripe'

const prisma = new PrismaClient()

// Type definitions for Stripe webhook events
type StripeCheckoutSession = Stripe.Checkout.Session
type StripePaymentIntent = Stripe.PaymentIntent
type StripeDispute = Stripe.Dispute
type StripeCharge = Stripe.Charge
type StripeLineItem = Stripe.LineItem
type StripePrice = Stripe.Price
type StripeProduct = Stripe.Product

interface MetadataItem {
  priceId: string
  quantity: number
  title: string
  licenseType: LicenseType
  beatId?: string
}

interface OrderStatusUpdateData {
  reason?: string
  cancelledAt?: Date
  failedAt?: Date
  failureCode?: string
  disputedAt?: Date
  disputeId?: string
  disputeReason?: string
  refundedAt?: Date
  refundId?: string
  refundAmount?: number
}

interface OrderItem {
  beatId: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = (await headers()).get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      // Verify the webhook signature
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    console.log('Received webhook event:', event.type)
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleSuccessfulPayment(event.data.object as StripeCheckoutSession)
        break
        
      case 'checkout.session.expired':
        await handleExpiredSession(event.data.object as StripeCheckoutSession)
        break
        
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as StripePaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        break
        
      case 'payment_intent.payment_failed':
        await handleFailedPayment(event.data.object as StripePaymentIntent)
        break
        
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as StripeDispute)
        break
        
      case 'charge.refunded':
        await handleRefunded(event.data.object as StripeCharge)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Handle successful payment
async function handleSuccessfulPayment(session: StripeCheckoutSession) {
        console.log('Payment successful for session:', session.id)
        console.log('Session details:', {
          id: session.id,
          customer_email: session.customer_email,
          amount_total: session.amount_total,
          currency: session.currency
        })
        
        try {
          // Retrieve the full session details from Stripe
          const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items', 'line_items.data.price.product']
          })

          if (!fullSession.line_items?.data || fullSession.line_items.data.length === 0) {
            console.error('No line items found in session:', session.id)
      return
          }

          const lineItems = fullSession.line_items.data
          await handleMultiItemOrder(fullSession, lineItems)

  } catch (error) {
    console.error('Error processing checkout session:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Handle expired/cancelled session
async function handleExpiredSession(session: StripeCheckoutSession) {
  console.log('Session expired:', session.id)
  
  try {
    // Update order status to CANCELLED
    await updateOrderStatus(session.id, OrderStatus.CANCELLED, {
      reason: 'Session expired',
      cancelledAt: new Date()
    })
    
    console.log('Order cancelled due to expired session:', session.id)
  } catch (error) {
    console.error('Error handling expired session:', error)
  }
}

// Handle failed payment
async function handleFailedPayment(paymentIntent: StripePaymentIntent) {
  console.log('Payment failed:', paymentIntent.id)
  
  try {
    // Find the order by payment ID
    const order = await findOrderByPaymentId(paymentIntent.id)
    
    if (order) {
      await updateOrderStatus(paymentIntent.id, 'FAILED' as OrderStatus, {
        reason: paymentIntent.last_payment_error?.message || 'Payment failed',
        failedAt: new Date(),
        failureCode: paymentIntent.last_payment_error?.code
      })
      
      console.log('Order marked as failed:', order.id)
      
      // Send failure notification email
      try {
        await sendPaymentFailureEmail(order.customerEmail, order.id, paymentIntent.last_payment_error?.message)
      } catch (emailError) {
        console.error('Failed to send failure email:', emailError)
      }
    }
  } catch (error) {
    console.error('Error handling failed payment:', error)
  }
}

// Handle dispute/chargeback
async function handleDisputeCreated(dispute: StripeDispute) {
  console.log('Dispute created:', dispute.id)
  
  try {
    const paymentIntentId = typeof dispute.payment_intent === 'string' ? dispute.payment_intent : dispute.payment_intent?.id
    if (!paymentIntentId) {
      console.error('No payment intent ID found in dispute:', dispute.id)
      return
    }
    
    const order = await findOrderByPaymentId(paymentIntentId)
    
    if (order) {
      await updateOrderStatus(paymentIntentId, 'DISPUTED' as OrderStatus, {
        reason: 'Payment disputed',
        disputedAt: new Date(),
        disputeId: dispute.id,
        disputeReason: dispute.reason
      })
      
      console.log('Order marked as disputed:', order.id)
      
      // Send dispute notification email
      try {
        await sendDisputeNotificationEmail(order.customerEmail, order.id, dispute.reason)
      } catch (emailError) {
        console.error('Failed to send dispute email:', emailError)
      }
    }
  } catch (error) {
    console.error('Error handling dispute:', error)
  }
}

// Handle refund
async function handleRefunded(charge: StripeCharge) {
  console.log('Charge refunded:', charge.id)
  
  try {
    const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
    if (!paymentIntentId) {
      console.error('No payment intent ID found in charge:', charge.id)
      return
    }
    
    const order = await findOrderByPaymentId(paymentIntentId)
    
    if (order) {
      await updateOrderStatus(paymentIntentId, OrderStatus.REFUNDED, {
        reason: 'Payment refunded',
        refundedAt: new Date(),
        refundId: charge.refunds?.data?.[0]?.id,
        refundAmount: charge.refunds?.data?.[0]?.amount
      })
      
      console.log('Order marked as refunded:', order.id)
      
      // Send refund notification email
      try {
        await sendRefundNotificationEmail(order.customerEmail, order.id, charge.refunds?.data?.[0]?.amount)
      } catch (emailError) {
        console.error('Failed to send refund email:', emailError)
      }
    }
  } catch (error) {
    console.error('Error handling refund:', error)
  }
}

// Helper function to find order by payment ID
async function findOrderByPaymentId(paymentId: string) {
  const multiOrder = await prisma.multiItemOrder.findFirst({
    where: { paymentId },
  })

  return multiOrder
}

async function updateOrderStatus(
  paymentId: string,
  status: OrderStatus,
  additionalData: OrderStatusUpdateData = {},
) {
  const multiOrder = await prisma.multiItemOrder.findFirst({
    where: { paymentId },
  })

  if (multiOrder) {
    await prisma.multiItemOrder.update({
      where: { id: multiOrder.id },
      data: {
        status,
        ...additionalData,
      },
    })
  }
}
async function handleMultiItemOrder(fullSession: StripeCheckoutSession, lineItems: StripeLineItem[]) {
            console.log('Processing multi-item order with', lineItems.length, 'items')
            
  // Get order ID from session metadata
  const orderId = fullSession.metadata?.order_id
  console.log('🔍 Multi-item webhook - Order ID from metadata:', orderId)
  
  // Find existing order by order_id from metadata
  let existingOrder = null
  
  if (orderId) {
    existingOrder = await prisma.multiItemOrder.findFirst({
      where: { id: orderId },
      include: { items: true }
    })
    console.log('🔍 Found multi-item order by order_id:', existingOrder?.id)
  }
  
  if (!existingOrder) {
    console.warn('No existing multi-item order found, using fallback creation')
    // Fallback: créer une nouvelle commande (ancien comportement)
    // ... (code existant)
    return
  }
  
  // Update existing order to PAID status
  const orderItems: OrderItem[] = []
            let totalAmount = 0

  // Parse items from metadata to get license types
  const metadataItems: MetadataItem[] = fullSession.metadata?.items ? JSON.parse(fullSession.metadata.items) : []
  console.log('🔍 Metadata items:', metadataItems)

            for (const lineItem of lineItems) {
    const price = lineItem.price as StripePrice
    const product = price?.product as StripeProduct

              if (!product || typeof product === 'string' || product.deleted) {
                console.error('Invalid or deleted product data in line item:', lineItem.id)
                continue
              }

              const beatId = product.metadata?.beat_id
              if (!beatId) {
                console.error('No beat_id found in product metadata:', product.id)
                continue
              }

              const beat = await BeatService.getBeatById(beatId)
              if (!beat) {
                console.error('Beat not found:', beatId)
                continue
              }

              const quantity = lineItem.quantity || 1
              const unitPrice = (price.unit_amount || 0) / 100
              const itemTotal = unitPrice * quantity
              totalAmount += itemTotal

    // Find corresponding metadata item to get license type
    const metadataItem = metadataItems.find((item: MetadataItem) => item.priceId === price.id)
    const licenseType = metadataItem?.licenseType || 'WAV_LEASE'
    console.log('🔍 Item license type:', licenseType)

              orderItems.push({
                beatId,
                quantity,
                unitPrice,
                totalPrice: itemTotal
              })
            }

            if (orderItems.length === 0) {
              console.error('No valid items found for multi-item order')
    return
            }

  // Update existing order to PAID status
  const updatedOrder = await prisma.multiItemOrder.update({
    where: { id: existingOrder.id },
              data: {
      status: OrderStatus.PAID,
      paidAt: new Date(),
      sessionId: fullSession.id,
      customerEmail: fullSession.customer_email || fullSession.customer_details?.email || existingOrder.customerEmail,
      customerName: fullSession.customer_details?.name || existingOrder.customerName,
      customerPhone: fullSession.customer_details?.phone || existingOrder.customerPhone,
      totalAmount: totalAmount,
                currency: fullSession.currency?.toUpperCase() || 'EUR',
                paymentMethod: 'card',
      // Update items with calculated prices and license types
                items: {
        deleteMany: {}, // Supprimer les anciens items
        create: orderItems.map((item, index) => {
          const metadataItem = metadataItems[index]
          const licenseType = metadataItem?.licenseType || 'WAV_LEASE'
          return {
                    beatId: item.beatId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            licenseType: licenseType
          }
        })
      }
    }
  })

  console.log('Multi-item order updated to PAID status:', updatedOrder.id)

  // Send confirmation email
            try {
              await sendOrderConfirmationEmail(
      updatedOrder.id,
      updatedOrder.customerEmail
              )
            } catch (emailError) {
              console.error('Failed to send confirmation email for multi-item order:', emailError)
  }
}

// Email notification functions
async function sendPaymentFailureEmail(email: string, orderId: string, errorMessage?: string) {
  // TODO: Implement payment failure email
  console.log(`Payment failure email would be sent to ${email} for order ${orderId}: ${errorMessage}`)
}

async function sendDisputeNotificationEmail(email: string, orderId: string, reason: string) {
  // TODO: Implement dispute notification email
  console.log(`Dispute notification email would be sent to ${email} for order ${orderId}: ${reason}`)
}

async function sendRefundNotificationEmail(email: string, orderId: string, refundAmount?: number) {
  // TODO: Implement refund notification email
  console.log(`Refund notification email would be sent to ${email} for order ${orderId}: ${refundAmount}`)
}
