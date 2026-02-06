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
      {/* Main Card */}
      <div className="relative bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-border/20 shadow-2xl hover:shadow-3xl transition-all duration-500">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Content Section */}
        <div className="p-6 sm:p-8 relative z-20">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {t('admin.editFiles')}
            </h2>
            <p className="text-base text-muted-foreground">
              {beat.title}
            </p>
          </div>

          {/* Error Display */}
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

          {/* Upload Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Preview Audio */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-400" />
                {t('upload.previewAudio')}
              </h3>
              
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-purple-500/20">
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
                  <label
                    htmlFor="preview-upload"
                    className="block w-full p-4 border-2 border-dashed border-purple-400/50 rounded-xl hover:border-purple-400 transition-colors text-center cursor-pointer touch-manipulation bg-purple-500/5 hover:bg-purple-500/10"
                  >
                    {uploadedFiles.preview ? (
                      <div className="flex items-center gap-2 text-purple-300">
                        <Music className="w-4 h-4" />
                        <span className="text-sm truncate flex-1">{uploadedFiles.preview.name}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onRemoveFile('preview');
                          }}
                          className="ml-auto text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">{t('admin.replacePreviewFile')}</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Master Audio - S3 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileAudio className="w-5 h-5 text-green-400" />
                {t('upload.masterAudio')} - S3
              </h3>
              
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-4 border border-green-500/20">
                {beat.s3MasterUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <p className="text-green-300 text-sm">{t('admin.masterFileOnS3')}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-foreground text-sm">
                        ✅ {t('admin.masterUploadedToS3')} (limite: 500MB)
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

            {/* Artwork */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-400" />
                {t('upload.artwork')}
              </h3>
              
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-4 border border-blue-500/20">
                {beat.artworkUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                        <p className="text-blue-300 text-sm">{t('admin.currentImageAvailable')}</p>
                      </div>
                      <button
                        onClick={onRemoveArtwork}
                        className="text-red-400 hover:text-red-300 transition-colors"
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
                  <label
                    htmlFor="artwork-upload"
                    className="block w-full p-4 border-2 border-dashed border-blue-400/50 rounded-xl hover:border-blue-400 transition-colors text-center cursor-pointer touch-manipulation bg-blue-500/5 hover:bg-blue-500/10"
                  >
                    {uploadedFiles.artwork ? (
                      <div className="flex items-center gap-2 text-blue-300">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-sm truncate flex-1">{uploadedFiles.artwork.name}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onRemoveFile('artwork');
                          }}
                          className="ml-auto text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">{t('admin.replaceCoverImage')}</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Stems Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Archive className="w-5 h-5 text-orange-400" />
              {t('upload.stems')} - S3
            </h3>
            
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-orange-500/20">
              {beat.s3StemsUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-400" />
                      <p className="text-orange-300 text-sm">{t('admin.stemsFileAvailable')}</p>
                    </div>
                    <button
                      onClick={onRemoveStems}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title={t('common.remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
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
                <label
                  htmlFor="stems-upload"
                  className="block w-full p-4 border-2 border-dashed border-orange-400/50 rounded-xl hover:border-orange-400 transition-colors text-center cursor-pointer touch-manipulation bg-orange-500/5 hover:bg-orange-500/10"
                >
                  {uploadedFiles.stems ? (
                    <div className="flex items-center gap-2 text-orange-300">
                      <Archive className="w-4 h-4" />
                      <span className="text-sm truncate flex-1">{uploadedFiles.stems.name}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onRemoveFile('stems');
                        }}
                        className="ml-auto text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">{t('admin.replaceStemsFile')}</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {hasFilesToUpload && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-indigo-400" />
                {t('admin.uploadProgress')}
              </h3>
              
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-6 border border-indigo-500/20">
                <div className="space-y-4">
                  {uploadedFiles.preview && (
                    <div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-2">
                          <Music className="w-4 h-4 text-purple-400" />
                          Preview
                        </span>
                        <span>{uploadProgress.preview}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress.preview}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadedFiles.master && (
                    <div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-2">
                          <FileAudio className="w-4 h-4 text-green-400" />
                          Master
                        </span>
                        <span>{uploadProgress.master}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress.master}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadedFiles.artwork && (
                    <div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-blue-400" />
                          Artwork
                        </span>
                        <span>{uploadProgress.artwork}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress.artwork}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadedFiles.stems && (
                    <div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-2">
                          <Archive className="w-4 h-4 text-orange-400" />
                          Stems
                        </span>
                        <span>{uploadProgress.stems}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress.stems}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onUpload}
              disabled={isUploading || !hasFilesToUpload}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-muted disabled:to-muted disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:transform-none"
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{t('admin.uploading')}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Save className="w-5 h-5" />
                  <span>{t('admin.saveFiles')}</span>
                </div>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
