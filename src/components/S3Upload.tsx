'use client'

import { useState, useRef } from 'react'
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

interface S3UploadProps {
  beatId: string
  folder: 'masters' | 'stems'
  onUploadComplete: (result: { url: string; key: string }) => void
  onUploadError: (error: string) => void
  maxSize?: number // en MB
  acceptedTypes?: string[]
}

export function S3Upload({ 
  beatId, 
  folder, 
  onUploadComplete, 
  onUploadError,
  maxSize = 500,
  acceptedTypes = ['audio/wav', 'audio/mpeg', 'application/zip']
}: S3UploadProps) {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Vérification de la taille
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      const error = t('upload.fileTooLarge', { size: fileSizeMB.toFixed(2), max: maxSize })
      setErrorMessage(error)
      setUploadStatus('error')
      onUploadError(error)
      return
    }

    // Vérification du type
    if (!acceptedTypes.includes(file.type)) {
      const error = t('upload.unsupportedFileType', { type: file.type })
      setErrorMessage(error)
      setUploadStatus('error')
      onUploadError(error)
      return
    }

    await uploadToS3(file)
  }

  const uploadToS3 = async (file: File) => {
    setUploading(true)
    setUploadStatus('uploading')
    setProgress(0)
    setErrorMessage('')

    try {
      // Essayer d'abord l'upload direct avec URL signée
      try {
        await uploadDirectToS3(file)
      } catch (corsError) {
        console.warn('Upload direct échoué (CORS), utilisation du proxy:', corsError)
        // Fallback vers le proxy API
        await uploadViaProxy(file)
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('upload.unknownError')
      setErrorMessage(errorMsg)
      setUploadStatus('error')
      onUploadError(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  const uploadDirectToS3 = async (file: File) => {
    // Étape 1: Obtenir l'URL signée
    const params = new URLSearchParams({
      fileName: file.name,
      contentType: file.type,
      folder: `beats/${folder}`,
      beatId: beatId,
      fileSize: file.size.toString()
    })

    const presignedResponse = await fetch(`/api/s3/upload?${params}`)
    
    if (!presignedResponse.ok) {
      const errorData = await presignedResponse.json()
      throw new Error(errorData.message || t('upload.signedUrlGenerationError'))
    }

    const presignedData = await presignedResponse.json()
    
    // Étape 2: Upload direct vers S3 avec progression
    setProgress(50) // Progression après obtention de l'URL signée
    
    const uploadResponse = await fetch(presignedData.data.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    })

    if (!uploadResponse.ok) {
      throw new Error(t('upload.s3UploadError', { status: uploadResponse.status }))
    }

    setProgress(100)
    setUploadStatus('success')
    
    // Retourner les données avec la clé S3 et l'URL publique
    onUploadComplete({
      url: presignedData.data.publicUrl,
      key: presignedData.data.key
    })
  }

  const uploadViaProxy = async (file: File) => {
    // Upload via proxy API (pas de problème CORS)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', `beats/${folder}`)
    formData.append('beatId', beatId)

    const response = await fetch('/api/s3/upload-proxy', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || t('upload.proxyUploadError'))
    }

    const result = await response.json()
    
    setProgress(100)
    setUploadStatus('success')
    onUploadComplete(result.data)
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <Loader2 className="w-5 h-5 animate-spin" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Upload className="w-5 h-5" />
    }
  }

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return t('upload.uploadInProgress')
      case 'success':
        return t('upload.uploadSuccessful')
      case 'error':
        return t('upload.uploadError')
      default:
        return folder === 'masters' ? t('upload.uploadMaster') : t('upload.uploadStems')
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <button
        onClick={triggerFileSelect}
        disabled={uploading}
        className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors rounded-lg bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex flex-col items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
          <span className="text-xs text-gray-500">
            {t('upload.maxSize', { size: maxSize })} • {t('upload.fileTypes', { types: acceptedTypes.map(type => type.split('/')[1]).join(', ') })}
          </span>
        </div>
      </button>

      {uploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-center text-gray-500">
            {progress}% - {progress < 50 ? t('upload.generatingSignedUrl') : t('upload.uploadingToS3')}
          </p>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            {t('upload.fileUploadedSuccessfully')}
          </p>
        </div>
      )}
    </div>
  )
}
