import { PrismaClient } from '@prisma/client'
import { emailService } from './emailService'

const prisma = new PrismaClient()

interface OrderEmailData {
  customerEmail: string
  customerName?: string
  orderId: string
  totalAmount: number
  currency: string
  isMultiItem: boolean
  beats: {
    beatTitle: string
    masterUrl: string
    hasStems?: boolean
    stemsUrl?: string
  }[]
  expiresAt: string
}

export async function sendOrderConfirmationEmail(
  orderId: string,
  customerEmail: string,
  isMultiItem: boolean = false
): Promise<void> {
  try {
    console.log(`📧 Preparing to send confirmation email for order ${orderId}`)

    let orderData: OrderEmailData

    if (isMultiItem) {
      // Handle multi-item order
      const multiOrder = await prisma.multiItemOrder.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              beat: true
            }
          }
        }
      })

      if (!multiOrder) {
        throw new Error(`Multi-item order ${orderId} not found`)
      }

      // Generate download URLs for each beat
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now

      const beats = multiOrder.items.map(item => {
        const masterUrl = `${baseUrl}/api/download/beat/${item.beat.id}?orderId=${orderId}&customerEmail=${encodeURIComponent(customerEmail)}&type=master`
        const hasStems = !!item.beat.stemsUrl && (item.licenseType === 'TRACKOUT_LEASE' || item.licenseType === 'UNLIMITED_LEASE')
        const stemsUrl = hasStems ? `${baseUrl}/api/download/stems/${item.beat.id}?orderId=${orderId}&customerEmail=${encodeURIComponent(customerEmail)}` : undefined

        return {
          beatTitle: item.beat.title,
          masterUrl,
          hasStems,
          stemsUrl
        }
      })

      orderData = {
        customerEmail: multiOrder.customerEmail,
        customerName: multiOrder.customerName || undefined,
        orderId: multiOrder.id,
        totalAmount: Number(multiOrder.totalAmount),
        currency: multiOrder.currency,
        isMultiItem: true,
        beats,
        expiresAt: expiresAt.toISOString()
      }
    } else {
      // Handle single-item order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          beat: true
        }
      })

      if (!order) {
        throw new Error(`Order ${orderId} not found`)
      }

      // Generate download URLs
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now

      const masterUrl = `${baseUrl}/api/download/beat/${order.beat.id}?orderId=${orderId}&customerEmail=${encodeURIComponent(customerEmail)}&type=master`
      const hasStems = !!order.beat.stemsUrl && (order.licenseType === 'TRACKOUT_LEASE' || order.licenseType === 'UNLIMITED_LEASE')
      const stemsUrl = hasStems ? `${baseUrl}/api/download/stems/${order.beat.id}?orderId=${orderId}&customerEmail=${encodeURIComponent(customerEmail)}` : undefined

      orderData = {
        customerEmail: order.customerEmail,
        customerName: order.customerName || undefined,
        orderId: order.id,
        totalAmount: Number(order.totalAmount),
        currency: order.currency,
        isMultiItem: false,
        beats: [{
          beatTitle: order.beat.title,
          masterUrl,
          hasStems,
          stemsUrl
        }],
        expiresAt: expiresAt.toISOString()
      }
    }

    // Send the email
    await emailService.sendOrderConfirmationEmail(orderData)
    console.log(`✅ Order confirmation email sent successfully for order ${orderId}`)

  } catch (error) {
    console.error(`❌ Failed to send order confirmation email for order ${orderId}:`, error)
    // Don't throw the error to avoid breaking the webhook flow
    // The order is still valid even if email fails
  }
}

export { emailService }
