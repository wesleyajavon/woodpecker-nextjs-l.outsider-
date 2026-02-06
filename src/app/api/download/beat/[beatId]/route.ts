import { NextRequest, NextResponse } from 'next/server'
import { CloudinaryService } from '@/lib/cloudinary'
import { s3Service } from '@/lib/s3-service'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isUserAdmin } from '@/lib/roleUtils'
import { getContentDispositionAttachment } from '@/lib/utils'

interface RouteParams {
  params: Promise<{
    beatId: string
  }>
}

interface DownloadUrls {
  master: string
  stems?: string
  expiresAt: string
}

interface OrderWithBeat {
  id: string
  customerEmail: string
  licenseType?: string
  totalAmount?: unknown // Prisma Decimal type
  beat: {
    id: string
    title: string
    fullUrl: string | null
    previewUrl: string | null
    [key: string]: unknown // Allow additional properties from Prisma
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { beatId } = await params
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const customerEmail = searchParams.get('customerEmail')
    const type = searchParams.get('type') || 'master' // 'preview' | 'master'
    const adminAccess = searchParams.get('admin') === 'true'

    // Mode admin: accès direct aux fichiers sans commande
    if (adminAccess) {
      const session = await getServerSession(authOptions)
      if (!session?.user?.email || !(await isUserAdmin(session.user.email))) {
        return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
      }

      // Récupérer le beat
      const beat = await prisma.beat.findUnique({ where: { id: beatId } })
      if (!beat) {
        return NextResponse.json({ error: 'Beat non trouvé' }, { status: 404 })
      }

      let downloadUrl: string | null = null
      let filename: string

      if (type === 'preview') {
        // Preview toujours sur Cloudinary
        const extractPublicId = (url: string): string | null => {
          const match = url.match(/\/v\d+\/(.+)\.(mp3|wav)$/)
          return match ? match[1] : null
        }
        
        const previewPublicId = beat.previewUrl ? extractPublicId(beat.previewUrl) : null
        if (!previewPublicId) {
          return NextResponse.json({ error: 'Preview indisponible' }, { status: 404 })
        }
        downloadUrl = CloudinaryService.generateSignedUrl(previewPublicId, 30, {
          format: 'mp3',
          quality: 'auto:low'
        }, 'video')
        filename = `${beat.title}_preview.mp3`
      } else if (type === 'stems') {
        // Stems sur S3
        if (!beat.s3StemsKey) {
          return NextResponse.json({ error: 'Stems indisponibles' }, { status: 404 })
        }
        downloadUrl = await s3Service.generatePresignedDownloadUrl(beat.s3StemsKey, 30 * 60) // 30 minutes
        filename = `${beat.title}_stems.zip`
      } else {
        // Master - essayer S3 d'abord, puis fallback Cloudinary
        if (beat.s3MasterKey) {
          try {
            downloadUrl = await s3Service.generatePresignedDownloadUrl(beat.s3MasterKey, 30 * 60) // 30 minutes
            filename = `${beat.title}_master.wav`
          } catch (s3Error) {
            console.error('S3 download failed, falling back to Cloudinary:', s3Error)
            // Fallback vers Cloudinary si S3 échoue
            const extractPublicId = (url: string): string | null => {
              const match = url.match(/\/v\d+\/(.+)\.(mp3|wav)$/)
              return match ? match[1] : null
            }
            
            const masterPublicId = beat.fullUrl ? extractPublicId(beat.fullUrl) : null
            if (!masterPublicId) {
              return NextResponse.json({ error: 'Master indisponible' }, { status: 404 })
            }
            downloadUrl = CloudinaryService.generateSignedUrl(masterPublicId, 30, {
              format: 'wav',
              quality: 'auto:best'
            }, 'video')
            filename = `${beat.title}_master.wav`
          }
        } else {
          return NextResponse.json({ error: 'Master indisponible' }, { status: 404 })
        }
      }

      const response = NextResponse.redirect(downloadUrl!)
      response.headers.set('Content-Disposition', getContentDispositionAttachment(filename))
      response.headers.set('Content-Type',
        type === 'preview' ? 'audio/mpeg' : type === 'stems' ? 'application/zip' : 'audio/wav')
      return response
    }

    // Mode client: nécessite une commande valide
    if (!beatId || !orderId || !customerEmail) {
      return NextResponse.json(
        { error: 'Beat ID, Order ID et email client requis' },
        { status: 400 }
      )
    }

    // Vérification que la commande existe et appartient au client
    // First try single order
    let order: OrderWithBeat | null = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerEmail: customerEmail,
        // status: 'PAID' // Seulement les commandes payées
      },
      include: {
        beat: true
      }
    })

    // If not found, try multi-item order
    if (!order) {
      const multiOrder = await prisma.multiItemOrder.findFirst({
        where: {
          id: orderId,
          customerEmail: customerEmail,
        },
        include: {
          items: {
            include: {
              beat: true
            }
          }
        }
      })

      if (multiOrder) {
        // Find the specific beat in the multi-item order
        const orderItem = multiOrder.items.find(item => item.beatId === beatId)
        if (orderItem) {
          order = {
            id: multiOrder.id,
            customerEmail: multiOrder.customerEmail,
            beat: orderItem.beat,
            licenseType: orderItem.licenseType
          }
        }
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée ou non autorisée' },
        { status: 404 }
      )
    }

    // Vérification que le beat correspond
    if (order.beat.id !== beatId) {
      return NextResponse.json(
        { error: 'Beat ne correspond pas à la commande' },
        { status: 400 }
      )
    }

    // Génération de l'URL de téléchargement appropriée
    let downloadUrl: string
    let filename: string

    if (type === 'preview' && order.beat.previewUrl) {
      // Preview toujours sur Cloudinary
      const extractPublicId = (url: string): string | null => {
        const match = url.match(/\/v\d+\/(.+)\.(mp3|wav)$/)
        return match ? match[1] : null
      }
      
      const previewPublicId = extractPublicId(order.beat.previewUrl)
      if (!previewPublicId) {
        return NextResponse.json(
          { error: 'Preview indisponible' },
          { status: 404 }
        )
      }
      downloadUrl = CloudinaryService.generateSignedUrl(previewPublicId, 30, {
        format: 'mp3',
        quality: 'auto:low'
      }, 'video')
      filename = `${order.beat.title}_preview.mp3`
    } else if (type === 'stems') {
      // Stems sur S3 - utiliser s3StemsKey
      const beat = await prisma.beat.findUnique({ 
        where: { id: beatId },
        select: { s3StemsKey: true }
      })
      
      if (!beat?.s3StemsKey) {
        return NextResponse.json(
          { error: 'Stems indisponibles' },
          { status: 404 }
        )
      }
      
      downloadUrl = await s3Service.generatePresignedDownloadUrl(beat.s3StemsKey, 30 * 60) // 30 minutes
      filename = `${order.beat.title}_stems.zip`
    } else {
      // Master sur S3 - utiliser s3MasterKey
      const beat = await prisma.beat.findUnique({ 
        where: { id: beatId },
        select: { s3MasterKey: true }
      })
      
      if (!beat?.s3MasterKey) {
        return NextResponse.json(
          { error: 'Master indisponible' },
          { status: 404 }
        )
      }
      
      downloadUrl = await s3Service.generatePresignedDownloadUrl(beat.s3MasterKey, 30 * 60) // 30 minutes
      filename = `${order.beat.title}_master.wav`
    }

    // Redirection vers l'URL Cloudinary avec les headers de téléchargement
    const response = NextResponse.redirect(downloadUrl)
    
    // Ajout des headers pour forcer le téléchargement
    response.headers.set('Content-Disposition', getContentDispositionAttachment(filename))
    response.headers.set('Content-Type', 
      type === 'preview' ? 'audio/mpeg' : type === 'stems' ? 'application/zip' : 'audio/wav')
    
    return response

  } catch (error) {
    console.error('Erreur lors du téléchargement:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { beatId } = await params
    const body = await request.json()
    const { orderId, customerEmail } = body

    if (!beatId || !orderId || !customerEmail) {
      return NextResponse.json(
        { error: 'Beat ID, Order ID et email client requis' },
        { status: 400 }
      )
    }

    // Vérification que la commande existe et appartient au client
    // First try single order
    let order: OrderWithBeat | null = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerEmail: customerEmail,
        // status: 'PAID' // Seulement les commandes payées
      },
      include: {
        beat: true
      }
    })

    // If not found, try multi-item order
    if (!order) {
      const multiOrder = await prisma.multiItemOrder.findFirst({
        where: {
          id: orderId,
          customerEmail: customerEmail,
        },
        include: {
          items: {
            include: {
              beat: true
            }
          }
        }
      })

      if (multiOrder) {
        // Find the specific beat in the multi-item order
        const orderItem = multiOrder.items.find(item => item.beatId === beatId)
        if (orderItem) {
          order = {
            id: multiOrder.id,
            customerEmail: multiOrder.customerEmail,
            beat: orderItem.beat,
            licenseType: orderItem.licenseType
          }
        }
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée ou non autorisée' },
        { status: 404 }
      )
    }

    // Vérification que le beat correspond
    if (order.beat.id !== beatId) {
      return NextResponse.json(
        { error: 'Beat ne correspond pas à la commande' },
        { status: 400 }
      )
    }

    // Vérification que le master S3 existe
    const beat = await prisma.beat.findUnique({ 
      where: { id: beatId },
      select: { s3MasterKey: true }
    })
    
    if (!beat?.s3MasterKey) {
      return NextResponse.json(
        { error: 'Fichier de beat non disponible' },
        { status: 404 }
      )
    }

    // Génération des URLs de téléchargement selon le type de licence
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const downloadUrls: DownloadUrls = {
      master: `${baseUrl}/api/download/beat/${beatId}?orderId=${orderId}&customerEmail=${encodeURIComponent(customerEmail)}&type=master`,
      expiresAt: new Date(Date.now() + (30 * 60 * 1000)).toISOString() // 30 minutes
    }

    // Ajouter les stems si licence Trackout ou Unlimited
    const licenseType = order.licenseType
    console.log('🔍 License type:', licenseType)
    
    if (licenseType === 'TRACKOUT_LEASE' || licenseType === 'UNLIMITED_LEASE') {
      // Vérifier que les stems existent
      const beatWithStems = await prisma.beat.findUnique({ 
        where: { id: beatId },
        select: { s3StemsKey: true, stemsUrl: true }
      })
      
      console.log('🔍 Beat stems data:', beatWithStems)
      
      if (beatWithStems?.s3StemsKey || beatWithStems?.stemsUrl) {
        downloadUrls.stems = `${baseUrl}/api/download/beat/${beatId}?orderId=${orderId}&customerEmail=${encodeURIComponent(customerEmail)}&type=stems`
        console.log('✅ Stems URL generated:', downloadUrls.stems)
      } else {
        console.log('❌ No stems available for this beat')
      }
    } else {
      console.log('❌ License type does not include stems:', licenseType)
    }

    return NextResponse.json({
      success: true,
      data: {
        beat: {
          id: order.beat.id,
          title: order.beat.title,
          genre: order.beat.genre,
          bpm: order.beat.bpm,
          key: order.beat.key
        },
        downloadUrls: {
          master: downloadUrls.master,
          expiresAt: downloadUrls.expiresAt,
          ...(downloadUrls.stems && { stems: downloadUrls.stems })
        },
        order: {
          id: order.id,
          licenseType: order.licenseType,
          totalAmount: order.totalAmount ? Number(order.totalAmount) : undefined
        }
      }
    })

  } catch (error) {
    console.error('Erreur lors de la génération des URLs de téléchargement:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

