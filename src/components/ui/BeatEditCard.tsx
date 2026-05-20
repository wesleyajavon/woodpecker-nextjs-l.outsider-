'use client';

import { motion } from 'framer-motion';
import { 
  Upload, 
  Music, 
  FileAudio, 
  X, 
  Save, 
  Image as ImageIcon, 
  Archive,
  AlertCircle,
  CheckCircle,
  Trash2,
  RefreshCw
} from 'lucide-react';
import Image from 'next/image';
import { Beat } from '@/types/beat';
import { useTranslation } from '@/contexts/LanguageContext';
import { S3Upload } from '@/components/S3Upload';
import { catalogPanelClass } from '@/components/catalog/catalog-styles';
import { cn } from '@/lib/utils';

interface BeatEditCardProps {
  beat: Beat;
  beatId: string;
  uploadedFiles: {
    preview?: File;
    master?: File;
    artwork?: File;
    stems?: File;
  };
  uploadProgress: {
    preview: number;
    master: number;
    artwork: number;
    stems: number;
  };
  isUploading: boolean;
  error: string | null;
  onFileSelect: (field: 'preview' | 'master' | 'artwork' | 'stems', file: File) => void;
  onRemoveFile: (field: 'preview' | 'master' | 'artwork' | 'stems') => void;
  onS3UploadComplete: (type: 'master' | 'stems', result: { url: string; key: string }) => void;
  onS3UploadError: (error: string) => void;
  onRemoveArtwork: () => void;
  onRemoveStems: () => void;
  onUpload: () => void;
}

const fileSectionClass = 'rounded-xl border border-white/10 bg-white/[0.03] p-4';
const dropzoneClass =
  'block w-full p-4 border-2 border-dashed border-white/12 rounded-xl hover:border-white/20 transition-opacity text-center cursor-pointer touch-manipulation bg-white/[0.02] hover:bg-white/[0.04]';

export default function BeatEditCard({
  beat,
  beatId,
  uploadedFiles,
  uploadProgress,
  isUploading,
  error,
  onFileSelect,
  onRemoveFile,
  onS3UploadComplete,
  onS3UploadError,
  onRemoveArtwork,
  onRemoveStems,
  onUpload
}: BeatEditCardProps) {
  const { t } = useTranslation();

  const hasFilesToUpload = Object.keys(uploadedFiles).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <div className={cn(catalogPanelClass, 'relative overflow-hidden rounded-2xl')}>
        <div className="p-6 sm:p-8 relative z-20">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {t('admin.editFiles')}
            </h2>
            <p className="text-base text-muted-foreground">
              {beat.title}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
            >
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Music className="w-5 h-5 text-muted-foreground" />
                {t('upload.previewAudio')}
              </h3>
              
              <div className={fileSectionClass}>
                {beat.previewUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <p className="text-green-300 text-sm">{t('admin.currentFileAvailable')}</p>
                      </div>
                    </div>
                    <audio
                      src={beat.previewUrl}
                      controls
                      className="w-full rounded-lg"
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">{t('admin.noPreviewFile')}</p>
                )}

                <div className="mt-4">
                  <input
                    type="file"
                    accept=".mp3,.wav,.aiff,.flac"
                    onChange={(e) => e.target.files?.[0] && onFileSelect('preview', e.target.files[0])}
                    className="hidden"
                    id="preview-upload"
                  />
                  <label htmlFor="preview-upload" className={dropzoneClass}>
                    {uploadedFiles.preview ? (
                      <div className="flex items-center gap-2 text-foreground">
                        <Music className="w-4 h-4" />
                        <span className="text-sm truncate flex-1">{uploadedFiles.preview.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            onRemoveFile('preview');
                          }}
                          className="ml-auto text-red-400 hover:text-red-300 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">{t('admin.replacePreviewFile')}</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileAudio className="w-5 h-5 text-muted-foreground" />
                {t('upload.masterAudio')} - S3
              </h3>
              
              <div className={fileSectionClass}>
                {beat.s3MasterUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <p className="text-green-300 text-sm">{t('admin.masterFileOnS3')}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                      <p className="text-foreground text-sm">
                        {t('admin.masterUploadedToS3')} (limite: 500MB)
                      </p>
                      <p className="text-muted-foreground text-xs mt-1 font-mono">
                        {beat.s3MasterKey}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-sm">{t('admin.noMasterFileOnS3')}</p>
                    <S3Upload
                      beatId={beatId}
                      folder="masters"
                      onUploadComplete={(result) => onS3UploadComplete('master', result)}
                      onUploadError={onS3UploadError}
                      maxSize={500}
                      acceptedTypes={['audio/wav', 'audio/aiff', 'audio/flac']}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                {t('upload.artwork')}
              </h3>
              
              <div className={fileSectionClass}>
                {beat.artworkUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.04]">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                        <p className="text-foreground text-sm">{t('admin.currentImageAvailable')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={onRemoveArtwork}
                        className="text-red-400 hover:text-red-300 transition-opacity"
                        title={t('common.remove')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="relative h-32 sm:h-48">
                      <Image
                        src={beat.artworkUrl}
                        alt={t('upload.artwork')}
                        fill
                        sizes="(max-width: 640px) 100vw, 400px"
                        className="object-cover rounded-xl"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm mb-4">{t('admin.noCoverImage')}</p>
                )}

                <div className="mt-4">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={(e) => e.target.files?.[0] && onFileSelect('artwork', e.target.files[0])}
                    className="hidden"
                    id="artwork-upload"
                  />
                  <label htmlFor="artwork-upload" className={dropzoneClass}>
                    {uploadedFiles.artwork ? (
                      <div className="flex items-center gap-2 text-foreground">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-sm truncate flex-1">{uploadedFiles.artwork.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            onRemoveFile('artwork');
                          }}
                          className="ml-auto text-red-400 hover:text-red-300 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">{t('admin.replaceCoverImage')}</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Archive className="w-5 h-5 text-muted-foreground" />
              {t('upload.stems')} - S3
            </h3>
            
            <div className={cn(fileSectionClass, 'p-6')}>
              {beat.s3StemsUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      <p className="text-foreground text-sm">{t('admin.stemsFileAvailable')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={onRemoveStems}
                      className="text-red-400 hover:text-red-300 transition-opacity"
                      title={t('common.remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                    <p className="text-foreground text-sm">{t('upload.stemsZipOptional')}</p>
                    <p className="text-muted-foreground text-xs mt-1 font-mono">
                      {beat.s3StemsKey}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">{t('admin.noStemsFile')}</p>
                  <S3Upload
                    beatId={beatId}
                    folder="stems"
                    onUploadComplete={(result) => onS3UploadComplete('stems', result)}
                    onUploadError={onS3UploadError}
                    maxSize={1024}
                    acceptedTypes={['application/zip', 'application/x-zip-compressed']}
                  />
                </div>
              )}

              <div className="mt-4">
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => e.target.files?.[0] && onFileSelect('stems', e.target.files[0])}
                  className="hidden"
                  id="stems-upload"
                />
                <label htmlFor="stems-upload" className={dropzoneClass}>
                  {uploadedFiles.stems ? (
                    <div className="flex items-center gap-2 text-foreground">
                      <Archive className="w-4 h-4" />
                      <span className="text-sm truncate flex-1">{uploadedFiles.stems.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onRemoveFile('stems');
                        }}
                        className="ml-auto text-red-400 hover:text-red-300 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">{t('admin.replaceStemsFile')}</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {hasFilesToUpload && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-muted-foreground" />
                {t('admin.uploadProgress')}
              </h3>
              
              <div className={cn(fileSectionClass, 'p-6')}>
                <div className="space-y-4">
                  {uploadedFiles.preview && (
                    <div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          Preview
                        </span>
                        <span>{uploadProgress.preview}%</span>
                      </div>
                      <div className="w-full bg-white/[0.06] rounded-full h-2">
                        <div
                          className="bg-white h-2 rounded-full transition-opacity"
                          style={{ width: `${uploadProgress.preview}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadedFiles.master && (
                    <div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-2">
                          <FileAudio className="w-4 h-4" />
                          Master
                        </span>
                        <span>{uploadProgress.master}%</span>
                      </div>
                      <div className="w-full bg-white/[0.06] rounded-full h-2">
                        <div
                          className="bg-white h-2 rounded-full transition-opacity"
                          style={{ width: `${uploadProgress.master}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadedFiles.artwork && (
                    <div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Artwork
                        </span>
                        <span>{uploadProgress.artwork}%</span>
                      </div>
                      <div className="w-full bg-white/[0.06] rounded-full h-2">
                        <div
                          className="bg-white h-2 rounded-full transition-opacity"
                          style={{ width: `${uploadProgress.artwork}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadedFiles.stems && (
                    <div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-2">
                          <Archive className="w-4 h-4" />
                          Stems
                        </span>
                        <span>{uploadProgress.stems}%</span>
                      </div>
                      <div className="w-full bg-white/[0.06] rounded-full h-2">
                        <div
                          className="bg-white h-2 rounded-full transition-opacity"
                          style={{ width: `${uploadProgress.stems}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={onUpload}
              disabled={isUploading || !hasFilesToUpload}
              className="flex-1 bg-white text-black hover:bg-white/90 disabled:bg-white/20 disabled:text-muted-foreground disabled:cursor-not-allowed font-semibold py-4 px-6 rounded-lg transition-opacity disabled:opacity-50"
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/20 border-t-black"></div>
                  <span>{t('admin.uploading')}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Save className="w-5 h-5" />
                  <span>{t('admin.saveFiles')}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
