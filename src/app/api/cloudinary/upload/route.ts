import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createHash } from 'crypto'

// GET - Génération d'URL d'upload directe Cloudinary
export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
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
    const fileSize = searchParams.get('fileSize')

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
    const allowedTypes = {
      audio: ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/flac'],
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      zip: ['application/zip', 'application/x-zip-compressed']
    }

    const isAudio = allowedTypes.audio.includes(contentType)
    const isImage = allowedTypes.image.includes(contentType)
    const isZip = allowedTypes.zip.includes(contentType)

    if (!isAudio && !isImage && !isZip) {
      return NextResponse.json(
        { 
          error: 'Type de fichier non autorisé',
          contentType,
          allowedTypes: Object.values(allowedTypes).flat()
        },
        { status: 400 }
      )
    }

    // Vérification de la taille du fichier
    if (fileSize) {
      const sizeInBytes = parseInt(fileSize)
      let maxSize = 10 * 1024 * 1024 // 10MB par défaut
      
      if (isAudio) maxSize = 100 * 1024 * 1024 // 100MB pour audio
      if (isImage) maxSize = 20 * 1024 * 1024  // 20MB pour images
      if (isZip) maxSize = 500 * 1024 * 1024  // 500MB pour ZIP
      
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

    // Génération de l'URL d'upload signée Cloudinary
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const publicId = `${folder}/${timestamp}-${randomId}-${fileName.replace(/\.[^/.]+$/, '')}`
    
    // Déterminer le type de ressource
    let resourceType: 'image' | 'video' | 'raw' = 'image'
    if (isAudio) resourceType = 'video'
    if (isZip) resourceType = 'raw'

    // Génération de la signature pour l'upload signé
    const timestamp_sign = Math.floor(Date.now() / 1000)
    
    // Paramètres de base pour la signature
    const params: Record<string, string> = {
      public_id: publicId,
      folder: folder,
      resource_type: resourceType,
      timestamp: timestamp_sign.toString()
    }

    // Ajouter les transformations selon le type
    if (isAudio) {
      params.format = 'mp3'
      params.quality = 'auto:low'
      if (folder.includes('previews')) {
        params.duration = '30'
      }
    } else if (isImage) {
      params.format = 'webp'
      params.quality = 'auto:best'
      params.width = '1200'
      params.height = '1200'
      params.crop = 'fill'
    }

    // Génération de la signature
    const signatureString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&') + process.env.CLOUDINARY_API_SECRET
    
    const signature = createHash('sha1').update(signatureString).digest('hex')

    // URL d'upload signée Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`
    
    // Paramètres d'upload avec signature
    const uploadParams = new URLSearchParams({
      ...params,
      signature,
      api_key: process.env.CLOUDINARY_API_KEY!
    })

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: `${uploadUrl}?${uploadParams.toString()}`,
        publicId,
        publicUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/${publicId}`,
        resourceType,
        maxFileSize: isZip ? 500 * 1024 * 1024 : isAudio ? 100 * 1024 * 1024 : 20 * 1024 * 1024,
        signature: signature,
        timestamp: timestamp_sign,
        apiKey: process.env.CLOUDINARY_API_KEY!,
        instructions: {
          method: 'POST',
          url: `${uploadUrl}?${uploadParams.toString()}`,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          body: 'FormData with file field',
          note: 'Upload signé Cloudinary - pas besoin d\'upload_preset'
        }
      }
    })

  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL Cloudinary:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération de l\'URL',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
