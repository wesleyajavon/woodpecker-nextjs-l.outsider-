import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface DownloadUrls {
  master: string
  stems?: string
  expiresAt: string
}

interface BeatDownloadUrls {
  beatId: string
  beatTitle: string
  downloadUrls: DownloadUrls
  hasStems?: boolean
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const { customerEmail } = await request.json()

    if (!orderId || !customerEmail) {
      return NextResponse.json(
        { error: 'Order ID and customer email are required' },
        { status: 400 }
      )
    }

    // Find the multi-item order
    const order = await prisma.multiItemOrder.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        customerEmail: true,
        items: {
          select: {
            licenseType: true,
            beat: {
              select: {
                id: true,
                title: true,
                stemsUrl: true,
                s3StemsKey: true,
              }
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

    // Verify customer email matches
    if (order.customerEmail !== customerEmail) {
      return NextResponse.json(
        { error: 'Unauthorized access to order' },
        { status: 403 }
      )
    }

    // Generate download URLs for each beat
    const beatDownloadUrls: BeatDownloadUrls[] = []
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const stemsLicense = (licenseType: string) =>
      licenseType === 'TRACKOUT_LEASE' || licenseType === 'UNLIMITED_LEASE'

    for (const item of order.items) {
      const beat = item.beat
      const beatHasStems = !!(beat.s3StemsKey || beat.stemsUrl)
      const includeStems = stemsLicense(item.licenseType) && beatHasStems

      const masterUrl = `${baseUrl}/api/download/beat/${beat.id}?orderId=${orderId}&customerEmail=${encodeURIComponent(customerEmail)}&type=master`

      const downloadUrls: DownloadUrls = {
        master: masterUrl,
        expiresAt: expiresAt.toISOString(),
      }

      if (includeStems) {
        downloadUrls.stems = `${baseUrl}/api/download/beat/${beat.id}?orderId=${orderId}&customerEmail=${encodeURIComponent(customerEmail)}&type=stems`
      }

      beatDownloadUrls.push({
        beatId: beat.id,
        beatTitle: beat.title,
        downloadUrls,
        hasStems: includeStems,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        customerEmail,
        beats: beatDownloadUrls,
        expiresAt: expiresAt.toISOString(),
      }
    })

  } catch (error) {
    console.error('Error generating multi-order download URLs:', error)
    return NextResponse.json(
      { error: 'Failed to generate download URLs' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
