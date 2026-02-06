import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { CloudinaryService } from '@/lib/cloudinary'

// Proxy pour l'upload Cloudinary - évite les problèmes CORS
export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    if (!folder) {
      return NextResponse.json(
        { error: 'Dossier de destination requis' },
        { status: 400 }
      )
    }

    // Vérification de la taille du fichier
    const maxSize = file.type.includes('zip') ? 500 * 1024 * 1024 : 
                   file.type.startsWith('audio/') ? 100 * 1024 * 1024 : 
                   20 * 1024 * 1024 // 20MB par défaut pour images
    
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          error: 'Fichier trop volumineux',
          message: `La taille du fichier (${(file.size / 1024 / 1024).toFixed(2)}MB) dépasse la limite autorisée (${maxSize / 1024 / 1024}MB)`,
          maxSize: `${maxSize / 1024 / 1024}MB`
        },
        { status: 413 }
      )
    }

    // Vérification du type de fichier
    const allowedTypes = {
      audio: ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/flac'],
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      zip: ['application/zip', 'application/x-zip-compressed']
    }

    const isAudio = allowedTypes.audio.includes(file.type)
    const isImage = allowedTypes.image.includes(file.type)
    const isZip = allowedTypes.zip.includes(file.type)

    if (!isAudio && !isImage && !isZip) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé' },
        { status: 400 }
      )
    }

    // Conversion du fichier en buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload vers Cloudinary selon le type
    let uploadResult
    if (isAudio) {
      uploadResult = await CloudinaryService.uploadAudio(
        buffer,
        folder,
        {
          resource_type: 'video',
          format: 'mp3',
          quality: 'auto:low',
          crop_duration: folder.includes('previews') ? 30 : undefined // 30s pour preview
        }
      )
    } else if (isImage) {
      uploadResult = await CloudinaryService.uploadImage(
        buffer,
        folder,
        {
          format: 'webp',
          quality: 'auto:best',
          width: 1200,
          height: 1200,
          crop: 'fill'
        }
      )
    } else if (isZip) {
      uploadResult = await CloudinaryService.uploadZip(
        buffer,
        folder,
        {
          resource_type: 'raw'
        }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult!.secure_url,
        publicId: uploadResult!.public_id,
        resourceType: uploadResult!.resource_type,
        size: uploadResult!.bytes
      }
    })

  } catch (error) {
    console.error('Erreur lors de l\'upload Cloudinary proxy:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'upload',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

// Configuration pour les gros fichiers
export const config = {
  maxDuration: 300, // 5 minutes
  api: {
    bodyParser: {
      sizeLimit: '100mb', // Augmenter la limite de taille
    },
  },
}
