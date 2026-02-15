'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Music, FileAudio, X, AlertCircle, Image as ImageIcon, Archive } from 'lucide-react';
import { BEAT_CONFIG } from '@/config/constants';
import { useTranslation } from '@/hooks/useApp';
import { Beat } from '@/types/beat';
import { S3Upload } from '@/components/S3Upload';
import { CloudinaryUpload } from '@/components/CloudinaryUpload';

interface BeatUploadProps {
  onUploadSuccess?: (beat: Beat) => void;
  onUploadError?: (error: string) => void;
}

interface UploadProgress {
  preview: number;
  master: number;
  artwork: number;
  stems: number;
}

export default function BeatUpload({ onUploadSuccess, onUploadError }: BeatUploadProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [, setUploadProgress] = useState<UploadProgress>({
    preview: 0,
    master: 0,
    artwork: 0,
    stems: 0
  });
  // uploadedFiles supprimé - maintenant nous utilisons cloudinaryUploads et s3Uploads
  const [s3Uploads, setS3Uploads] = useState<{
    master?: { url: string; key: string };
    stems?: { url: string; key: string };
  }>({});
  const [cloudinaryUploads, setCloudinaryUploads] = useState<{
    preview?: { url: string; publicId: string };
    artwork?: { url: string; publicId: string };
  }>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'Trap',
    bpm: 140,
    key: 'C',
    mode: 'majeur' as 'majeur' | 'mineur',
    duration: '3:00',
    wavLeasePrice: 19.99,
    trackoutLeasePrice: 39.99,
    unlimitedLeasePrice: 79.99,
    tags: [] as string[],
    isExclusive: false,
    featured: false,
    scheduledReleaseAt: '' as string
  });
  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState<string[]>([]);


  // Gestion des fichiers sélectionnés supprimée - maintenant gérée par CloudinaryUpload et S3Upload

  // Gestion des changements de formulaire
  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => prev.filter(error => !error.includes(field)));
  };

  // Ajout de tags
  const addTag = () => {
    if (currentTag.trim() && formData.tags.length < BEAT_CONFIG.maxTags) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  // Suppression de tags
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handlers pour les uploads S3
  const handleS3UploadComplete = (type: 'master' | 'stems', result: { url: string; key: string }) => {
    setS3Uploads(prev => ({ ...prev, [type]: result }));
    setErrors(prev => prev.filter(error => !error.includes(type)));
  };

  const handleS3UploadError = (error: string) => {
    onUploadError?.(error);
    setErrors(prev => [...prev, error]);
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.title.trim()) newErrors.push(t('upload.titleRequired'));
    if (formData.title.length > BEAT_CONFIG.maxTitleLength) {
      newErrors.push(t('upload.titleTooLong', { max: BEAT_CONFIG.maxTitleLength }));
    }
    if (formData.description && formData.description.length > BEAT_CONFIG.maxDescriptionLength) {
      newErrors.push(t('upload.descriptionTooLong', { max: BEAT_CONFIG.maxDescriptionLength }));
    }
    if (!cloudinaryUploads.preview) newErrors.push(t('upload.previewRequired'));
    if (!s3Uploads.master) newErrors.push(t('upload.masterRequired'));
    if (formData.wavLeasePrice <= 0) newErrors.push(t('upload.wavPriceRequired'));
    if (formData.trackoutLeasePrice <= 0) newErrors.push(t('upload.trackoutPriceRequired'));
    if (formData.unlimitedLeasePrice <= 0) newErrors.push(t('upload.unlimitedPriceRequired'));
    if (formData.bpm < 60 || formData.bpm > 200) newErrors.push(t('upload.bpmRange'));
    if (formData.scheduledReleaseAt.trim()) {
      const scheduledDate = new Date(formData.scheduledReleaseAt);
      if (isNaN(scheduledDate.getTime())) {
        newErrors.push(t('upload.scheduledReleaseAtInvalid'));
      } else if (scheduledDate <= new Date()) {
        newErrors.push(t('upload.scheduledReleaseAtPast'));
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Upload des fichiers
  const handleUpload = async () => {
    if (!validateForm()) return;

    setIsUploading(true);
    setUploadProgress({ preview: 0, master: 0, artwork: 0, stems: 0 });

    try {
      const formDataToSend = new FormData();
      
      // Ajout des URLs Cloudinary (au lieu des fichiers)
      if (cloudinaryUploads.preview) {
        formDataToSend.append('previewUrl', cloudinaryUploads.preview.url);
        formDataToSend.append('previewPublicId', cloudinaryUploads.preview.publicId);
      }
      if (cloudinaryUploads.artwork) {
        formDataToSend.append('artworkUrl', cloudinaryUploads.artwork.url);
        formDataToSend.append('artworkPublicId', cloudinaryUploads.artwork.publicId);
      }
      
      // Ajout des données S3
      if (s3Uploads.master) {
        formDataToSend.append('s3MasterUrl', s3Uploads.master.url);
        formDataToSend.append('s3MasterKey', s3Uploads.master.key);
      }
      if (s3Uploads.stems) {
        formDataToSend.append('s3StemsUrl', s3Uploads.stems.url);
        formDataToSend.append('s3StemsKey', s3Uploads.stems.key);
      }

      // Ajout des données du formulaire
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'scheduledReleaseAt') {
          if (value && typeof value === 'string' && value.trim()) {
            const localDate = new Date(value);
            if (!isNaN(localDate.getTime()) && localDate > new Date()) {
              formDataToSend.append(key, localDate.toISOString());
            }
          }
        } else if (key === 'tags') {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      // Simulation du progrès d'upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          preview: Math.min(prev.preview + 10, 100),
          master: Math.min(prev.master + 8, 100),
          artwork: Math.min(prev.artwork + 12, 100),
          stems: Math.min(prev.stems + 15, 100)
        }));
      }, 200);

      const response = await fetch('/api/beats/upload', {
        method: 'POST',
        body: formDataToSend
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('upload.uploadError'));
      }

      const result = await response.json();
      
      if (result.success) {
        onUploadSuccess?.(result.data.beat);
        // Reset du formulaire
        setFormData({
          title: '',
          description: '',
          genre: 'Trap',
          bpm: 140,
          key: 'C',
          mode: 'majeur',
          duration: '3:00',
          wavLeasePrice: 19.99,
          trackoutLeasePrice: 39.99,
          unlimitedLeasePrice: 79.99,
          tags: [],
          isExclusive: false,
          featured: false,
          scheduledReleaseAt: ''
        });
        setS3Uploads({});
        setCloudinaryUploads({});
        setUploadProgress({ preview: 0, master: 0, artwork: 0, stems: 0 });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.generic');
      onUploadError?.(errorMessage);
      setErrors([errorMessage]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto p-4 sm:p-6 bg-white/10 backdrop-blur-lg rounded-2xl">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        {t('admin.uploadNewBeat')}
      </h2>

      {/* Affichage des erreurs */}
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg"
        >
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Section des fichiers */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white mb-3">{t('upload.files')}</h3>

          {/* Preview Audio (Requis) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('upload.previewAudio')} <span className="text-red-400">*</span>
            </label>
            {cloudinaryUploads.preview ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-green-400" />
                    <p className="text-green-300 text-sm">{t('upload.previewUploaded')}</p>
                  </div>
                  <button
                    onClick={() => setCloudinaryUploads(prev => ({ ...prev, preview: undefined }))}
                    className="text-red-400 hover:text-red-300 cursor-pointer p-1 rounded hover:bg-red-400/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-foreground text-xs">
                    ✅ {t('upload.previewDetails')}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {t('upload.publicId')}: {cloudinaryUploads.preview.publicId}
                  </p>
                </div>
              </div>
            ) : (
              <CloudinaryUpload
                beatId="new-beat" // Placeholder pour les nouveaux beats
                folder="previews"
                onUploadComplete={(result) => setCloudinaryUploads(prev => ({ ...prev, preview: result }))}
                onUploadError={() => {
                  // Preview upload error handled by component
                }}
                maxSize={100} // 100MB
                acceptedTypes={['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/flac']}
              />
            )}
          </div>

          {/* Master Audio - S3 Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('upload.masterAudio')} <span className="text-red-400">*</span>
            </label>
            
            {s3Uploads.master ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <FileAudio className="w-4 h-4 text-green-400" />
                    <p className="text-green-300 text-sm">{t('upload.masterUploaded')}</p>
                  </div>
                  <button
                    onClick={() => setS3Uploads(prev => ({ ...prev, master: undefined }))}
                    className="text-red-400 hover:text-red-300 cursor-pointer p-1 rounded hover:bg-red-400/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-foreground text-xs">
                    ✅ {t('upload.masterDetails')}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {t('upload.s3Key')}: {s3Uploads.master.key}
                  </p>
                </div>
              </div>
            ) : (
              <S3Upload
                beatId="new-beat" // Placeholder pour les nouveaux beats
                folder="masters"
                onUploadComplete={(result) => handleS3UploadComplete('master', result)}
                onUploadError={handleS3UploadError}
                maxSize={500} // 500MB
                acceptedTypes={['audio/wav', 'audio/aiff', 'audio/flac']}
              />
            )}
          </div>

          {/* Artwork */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('upload.artwork')}
            </label>
            {cloudinaryUploads.artwork ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-green-400" aria-hidden />
                    <p className="text-green-300 text-sm">{t('upload.artworkUploaded')}</p>
                  </div>
                  <button
                    onClick={() => setCloudinaryUploads(prev => ({ ...prev, artwork: undefined }))}
                    className="text-red-400 hover:text-red-300 cursor-pointer p-1 rounded hover:bg-red-400/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-foreground text-xs">
                    ✅ {t('upload.artworkDetails')}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {t('upload.publicId')}: {cloudinaryUploads.artwork.publicId}
                  </p>
                </div>
              </div>
            ) : (
              <CloudinaryUpload
                beatId="new-beat" // Placeholder pour les nouveaux beats
                folder="artworks"
                onUploadComplete={(result) => setCloudinaryUploads(prev => ({ ...prev, artwork: result }))}
                onUploadError={() => {
                  // Artwork upload error handled by component
                }}
                maxSize={20} // 20MB
                acceptedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
              />
            )}
          </div>

          {/* Stems - S3 Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('upload.stems')}
            </label>
            
            {s3Uploads.stems ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-green-400" />
                    <p className="text-green-300 text-sm">{t('upload.stemsUploaded')}</p>
                  </div>
                  <button
                    onClick={() => setS3Uploads(prev => ({ ...prev, stems: undefined }))}
                    className="text-red-400 hover:text-red-300 cursor-pointer p-1 rounded hover:bg-red-400/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-foreground text-xs">
                    ✅ {t('upload.stemsDetails')}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {t('upload.s3Key')}: {s3Uploads.stems.key}
                  </p>
                </div>
              </div>
            ) : (
              <S3Upload
                beatId="new-beat" // Placeholder pour les nouveaux beats
                folder="stems"
                onUploadComplete={(result) => handleS3UploadComplete('stems', result)}
                onUploadError={handleS3UploadError}
                maxSize={1024} // 1GB
                acceptedTypes={['application/zip', 'application/x-zip-compressed']}
              />
            )}
          </div>

        </div>

        {/* Section des informations */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white mb-3">{t('upload.information')}</h3>

          {/* Titre */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('upload.title')} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t('upload.beatName')}
              maxLength={BEAT_CONFIG.maxTitleLength}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('upload.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t('upload.beatDescription')}
              rows={3}
              maxLength={BEAT_CONFIG.maxDescriptionLength}
            />
          </div>

          {/* Genre et BPM */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                {t('upload.genre')} <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.genre}
                onChange={(e) => handleInputChange('genre', e.target.value)}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {BEAT_CONFIG.genres.map((genre) => (
                  <option key={genre} value={genre} className="bg-gray-800 text-white">
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                {t('upload.bpm')} <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={formData.bpm}
                onChange={(e) => handleInputChange('bpm', parseInt(e.target.value))}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="60"
                max="200"
              />
            </div>
          </div>

          {/* Tonalité, Mode et Durée */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                {t('upload.key')} <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.key}
                onChange={(e) => handleInputChange('key', e.target.value)}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {BEAT_CONFIG.keys.map((key) => (
                  <option key={key} value={key} className="bg-gray-800 text-white">
                    {key}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                {t('upload.mode')} <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.mode}
                onChange={(e) => handleInputChange('mode', e.target.value as 'majeur' | 'mineur')}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {BEAT_CONFIG.modes.map((mode) => (
                  <option key={mode} value={mode} className="bg-gray-800 text-white">
                    {mode === 'majeur' ? t('upload.modeMajeur') : t('upload.modeMineur')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                {t('upload.duration')} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={t('upload.durationPlaceholder')}
              />
            </div>
          </div>

          {/* Prix par licence */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-white">{t('upload.pricePerLicense')}</h4>
            
            <div className="grid grid-cols-1 gap-3">
              {/* WAV Lease */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  {t('upload.wavLease')} <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={formData.wavLeasePrice}
                  onChange={(e) => handleInputChange('wavLeasePrice', parseFloat(e.target.value))}
                  className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Trackout Lease */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  {t('upload.trackoutLease')} <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={formData.trackoutLeasePrice}
                  onChange={(e) => handleInputChange('trackoutLeasePrice', parseFloat(e.target.value))}
                  className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Unlimited Lease */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  {t('upload.unlimitedLease')} <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={formData.unlimitedLeasePrice}
                  onChange={(e) => handleInputChange('unlimitedLeasePrice', parseFloat(e.target.value))}
                  className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('upload.tags')} ({formData.tags.length}/{BEAT_CONFIG.maxTags})
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={t('upload.addTag')}
                maxLength={20}
              />
              <button
                onClick={addTag}
                disabled={!currentTag.trim() || formData.tags.length >= BEAT_CONFIG.maxTags}
                className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
{t('common.add')}
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Publication planifiée */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('upload.scheduledReleaseAtLabel')}
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledReleaseAt}
              onChange={(e) => handleInputChange('scheduledReleaseAt', e.target.value)}
              className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
              min={(() => {
                const n = new Date();
                const p = (x: number) => x.toString().padStart(2, '0');
                return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}T${p(n.getHours())}:${p(n.getMinutes())}`;
              })()}
            />
            <p className="text-xs text-gray-400">
              {t('upload.scheduledReleaseAtHelp')}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={formData.isExclusive}
                onChange={(e) => handleInputChange('isExclusive', e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-white/20 border-white/30 rounded focus:ring-indigo-500"
              />
              {t('upload.exclusiveBeat')}
            </label>

            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-white/20 border-white/30 rounded focus:ring-indigo-500"
              />
              {t('upload.featured')}
            </label>
          </div>
        </div>
      </div>

      {/* Bouton d'upload */}
      <div className="mt-6 text-center">
        {/* Debug info pour comprendre l'état du bouton */}
        <div className="mb-4 p-3 bg-white/5 rounded-lg text-xs text-gray-300">
          <p>{t('upload.uploadStatus')}</p>
          <p>• {t('upload.previewCloudinary')}: {cloudinaryUploads.preview ? `✅ ${t('upload.uploaded')}` : `❌ ${t('upload.missing')}`}</p>
          <p>• {t('upload.masterS3')}: {s3Uploads.master ? `✅ ${t('upload.uploaded')}` : `❌ ${t('upload.missing')}`}</p>
          <p>• {t('upload.artworkCloudinary')}: {cloudinaryUploads.artwork ? `✅ ${t('upload.uploaded')}` : `⏸️ ${t('upload.optional')}`}</p>
          <p>• {t('upload.stemsS3')}: {s3Uploads.stems ? `✅ ${t('upload.uploaded')}` : `⏸️ ${t('upload.optional')}`}</p>
          <p>• {t('upload.buttonEnabled')}: {(!isUploading && cloudinaryUploads.preview && s3Uploads.master) ? `✅ ${t('upload.yes')}` : `❌ ${t('upload.no')}`}</p>
        </div>
        
        <button
          onClick={handleUpload}
          disabled={isUploading || !cloudinaryUploads.preview || !s3Uploads.master}
          className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          {isUploading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
{t('upload.uploading')}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
{t('upload.uploadBeat')}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
