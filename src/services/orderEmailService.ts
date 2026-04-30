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
  customerEmail: string
): Promise<void> {
  try {
    console.log(`📧 Preparing to send confirmation email for order ${orderId}`)

    const multiOrder = await prisma.multiItemOrder.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            beat: true,
          },
        },
      },
    })

    if (!multiOrder) {
      throw new Error(`Order ${orderId} not found`)
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

    const beats = multiOrder.items.map((item) => {
      const masterUrl = `${baseUrl}/api/download/beat/${item.beat.id}?orderId=${orderId}&customerEmail=${encodeURIComponent(customerEmail)}&type=master`
      const hasStems =
        !!item.beat.stemsUrl &&
        (item.licenseType === 'TRACKOUT_LEASE' || item.licenseType === 'UNLIMITED_LEASE')
      const stemsUrl = hasStems
        ? `${baseUrl}/api/download/stems/${item.beat.id}?orderId=${orderId}&customerEmail=${encodeURIComponent(customerEmail)}`
        : undefined

      return {
        beatTitle: item.beat.title,
        masterUrl,
        hasStems,
        stemsUrl,
      }
    })

    const orderData: OrderEmailData = {
      customerEmail: multiOrder.customerEmail,
      customerName: multiOrder.customerName || undefined,
      orderId: multiOrder.id,
      totalAmount: Number(multiOrder.totalAmount),
      currency: multiOrder.currency,
      isMultiItem: beats.length > 1,
      beats,
      expiresAt: expiresAt.toISOString(),
    }

    await emailService.sendOrderConfirmationEmail(orderData)
    console.log(`✅ Order confirmation email sent successfully for order ${orderId}`)
  } catch (error) {
    console.error(`❌ Failed to send order confirmation email for order ${orderId}:`, error)
  }
}

export { emailService }
