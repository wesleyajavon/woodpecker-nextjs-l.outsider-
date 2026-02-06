import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { s3Service } from '@/lib/s3-service'
import { S3_CONFIG } from '@/lib/aws-s3'
import { withUserRateLimit } from '@/lib/rate-limit'

// POST désactivé - utilisez GET pour obtenir une URL signée et uploader directement
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Méthode POST désactivée',
      message: 'Utilisez la méthode GET pour obtenir une URL signée et uploader directement vers S3',
      instructions: 'Appelez GET /api/s3/upload avec les paramètres fileName, contentType, folder et beatId'
    },
    { status: 405 }
  )
}

// Génération d'URL signée pour upload direct
export async function GET(request: NextRequest) {
  try {
    // Vérification du rate limiting pour les uploads
    const rateLimitResult = await withUserRateLimit(request, 'UPLOAD')
    if ('status' in rateLimitResult) {
      return rateLimitResult
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')
    const contentType = searchParams.get('contentType')
    const folder = searchParams.get('folder')
    const beatId = searchParams.get('beatId')
    const fileSize = searchParams.get('fileSize') // Taille estimée du fichier

    if (!fileName || !contentType || !folder) {
      return NextResponse.json(
        { error: 'Paramètres manquants', 
          required: ['fileName', 'contentType', 'folder'],
          received: { fileName, contentType, folder, beatId, fileSize }
        },
        { status: 400 }
      )
    }

    // Vérification du type de fichier
    const allowedTypes = [...S3_CONFIG.allowedTypes.audio, ...S3_CONFIG.allowedTypes.zip]
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { 
          error: 'Type de fichier non autorisé',
          contentType,
          allowedTypes
        },
        { status: 400 }
      )
    }

    // Vérification de la taille du fichier si fournie
    if (fileSize) {
      const sizeInBytes = parseInt(fileSize)
      const maxSize = contentType.includes('zip') ? S3_CONFIG.limits.maxStemsSize : S3_CONFIG.limits.maxFileSize
      
      if (sizeInBytes > maxSize) {
        return NextResponse.json(
          { 
            error: 'Fichier trop volumineux',
            message: `La taille du fichier (${(sizeInBytes / 1024 / 1024).toFixed(2)}MB) dépasse la limite autorisée (${maxSize / 1024 / 1024}MB)`,
            maxSize: `${maxSize / 1024 / 1024}MB`,
            fileSize: `${(sizeInBytes / 1024 / 1024).toFixed(2)}MB`
          },
          { status: 413 }
        )
      }
    }

    // Génération de l'URL signée avec expiration plus longue pour les gros fichiers
    const expiresIn = contentType.includes('zip') ? 7200 : 3600 // 2h pour ZIP, 1h pour audio
    const presignedData = await s3Service.generatePresignedUploadUrl({
      folder,
      fileName,
      contentType,
      metadata: {
        beatId: beatId || 'unknown',
        uploadedBy: session.user.email,
        uploadMethod: 'presigned-url'
      }
    }, expiresIn)

    return NextResponse.json({
      success: true,
      data: {
        ...presignedData,
        expiresIn,
        maxFileSize: contentType.includes('zip') ? S3_CONFIG.limits.maxStemsSize : S3_CONFIG.limits.maxFileSize,
        instructions: {
          method: 'PUT',
          url: presignedData.uploadUrl,
          headers: {
            'Content-Type': contentType
          }
        }
      }
    })

  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL signée:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération de l\'URL',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

// Configuration pour les gros fichiers
export const config = {
  maxDuration: 300, // 5 minutes
}
