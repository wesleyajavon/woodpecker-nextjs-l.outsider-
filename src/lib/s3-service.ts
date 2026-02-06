import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand 
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client, S3_CONFIG, S3UploadResult, S3UploadOptions } from './aws-s3'

interface S3FileMetadata {
  size?: number
  contentType?: string
  lastModified?: Date
  metadata?: Record<string, string>
}

export class S3Service {
  private client: S3Client

  constructor() {
    this.client = s3Client
  }

  /**
   * Upload un fichier vers S3
   */
  async uploadFile(
    buffer: Buffer, 
    options: S3UploadOptions
  ): Promise<S3UploadResult> {
    const { folder, fileName, contentType, metadata = {} } = options
    
    // Générer une clé unique pour éviter les conflits
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const key = `${folder}/${timestamp}-${randomId}-${fileName}`

    try {
      const command = new PutObjectCommand({
        Bucket: S3_CONFIG.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: {
          ...metadata,
          uploadedAt: new Date().toISOString(),
          originalName: fileName
        }
        // ACL supprimé car le bucket a les ACLs désactivées
      })

      await this.client.send(command)

      return {
        key,
        url: S3_CONFIG.getPublicUrl(key),
        bucket: S3_CONFIG.bucketName,
        size: buffer.length,
        contentType
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload S3:', error)
      throw new Error(`Échec de l'upload S3: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  /**
   * Génère une URL signée pour l'upload direct depuis le frontend
   */
  async generatePresignedUploadUrl(
    options: S3UploadOptions,
    expiresIn: number = 3600 // 1 heure par défaut
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    const { folder, fileName, contentType, metadata = {} } = options
    
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const key = `${folder}/${timestamp}-${randomId}-${fileName}`

    try {
      const command = new PutObjectCommand({
        Bucket: S3_CONFIG.bucketName,
        Key: key,
        ContentType: contentType,
        Metadata: {
          ...metadata,
          uploadedAt: new Date().toISOString(),
          originalName: fileName
        }
        // ACL supprimé car le bucket a les ACLs désactivées
      })

      const uploadUrl = await getSignedUrl(this.client, command, { expiresIn })

      return {
        uploadUrl,
        key,
        publicUrl: S3_CONFIG.getPublicUrl(key)
      }
    } catch (error) {
      console.error('Erreur lors de la génération de l\'URL signée:', error)
      throw new Error(`Échec de la génération de l'URL signée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  /**
   * Génère une URL signée pour le téléchargement
   */
  async generatePresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: S3_CONFIG.bucketName,
        Key: key,
        ResponseContentDisposition: 'attachment' // Force download
      })

      const signedUrl = await getSignedUrl(this.client, command, { 
        expiresIn,
        signableHeaders: new Set(['host'])
      })
      
      console.log(`Generated S3 signed URL for key: ${key}`)
      console.log(`URL expires in: ${expiresIn} seconds`)
      
      return signedUrl
    } catch (error) {
      console.error('Erreur lors de la génération de l\'URL de téléchargement:', error)
      throw new Error(`Échec de la génération de l'URL de téléchargement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  /**
   * Supprime un fichier de S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: S3_CONFIG.bucketName,
        Key: key
      })

      await this.client.send(command)
    } catch (error) {
      console.error('Erreur lors de la suppression S3:', error)
      throw new Error(`Échec de la suppression S3: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  /**
   * Vérifie si un fichier existe dans S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: S3_CONFIG.bucketName,
        Key: key
      })

      await this.client.send(command)
      return true
    } catch (_error) {
      return false
    }
  }

  /**
   * Obtient les métadonnées d'un fichier
   */
  async getFileMetadata(key: string): Promise<S3FileMetadata> {
    try {
      const command = new HeadObjectCommand({
        Bucket: S3_CONFIG.bucketName,
        Key: key
      })

      const response = await this.client.send(command)
      return {
        size: response.ContentLength,
        contentType: response.ContentType,
        lastModified: response.LastModified,
        metadata: response.Metadata
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des métadonnées:', error)
      throw new Error(`Échec de la récupération des métadonnées: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }
}

// Instance singleton
export const s3Service = new S3Service()
