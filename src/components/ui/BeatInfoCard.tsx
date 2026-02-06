'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Music, 
  Download, 
  Eye, 
  DollarSign,
  Tag,
  Clock,
  Users,
  Edit,
  Trash2,
  Upload,
  X,
  Heart,
  Share2,
  MoreVertical
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Beat } from '@/types/beat';
import { BEAT_CONFIG } from '@/config/constants';
import { useTranslation } from '@/contexts/LanguageContext';

interface BeatInfoCardProps {
  beat: Beat;
  isEditing?: boolean;
  editData?: Partial<Beat>;
  onEditChange?: (field: keyof Beat, value: string | number | boolean | string[]) => void;
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onEditFiles?: () => void;
  onStartEdit?: () => void;
  onToggleFeatured?: (featured: boolean) => void | Promise<void>;
  isSaving?: boolean;
  isDeleting?: boolean;
  isTogglingFeatured?: boolean;
}

export default function BeatInfoCard({
  beat,
  isEditing = false,
  editData = {},
  onEditChange,
  onSave,
  onCancel,
  onDelete,
  onEditFiles,
  onStartEdit,
  onToggleFeatured,
  isSaving = false,
  isDeleting = false,
  isTogglingFeatured = false
}: BeatInfoCardProps) {
  const { t } = useTranslation();
  const [, setIsPlaying] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleEditChange = (field: keyof Beat, value: string | number | boolean | string[]) => {
    if (onEditChange) {
      onEditChange(field, value);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      {/* Main Card */}
      <div className="relative bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-border/20 shadow-2xl hover:shadow-3xl transition-all duration-500">
        {/* Gradient Overlay - Behind content */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Artwork Section */}
        <div className="relative h-64 sm:h-80 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 overflow-hidden z-10">
          {beat.artworkUrl ? (
            <Image 
              src={beat.artworkUrl} 
              alt={beat.title}
              fill
              sizes="(max-width: 640px) 100vw, 400px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-16 h-16 text-indigo-400/50" />
            </div>
          )}

          {/* Action Menu */}
          <div className="absolute top-4 right-4 z-30">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowActions(!showActions)}
              className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/30 transition-colors duration-200"
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>
            
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-12 right-0 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/20 p-2 min-w-[160px] z-40"
              >
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Heart className="w-4 h-4" />
                  Add to Favorites
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </motion.div>
            )}
          </div>

          {/* Status Badge - cliquable pour basculer featured quand onToggleFeatured est fourni */}
          <div className="absolute top-4 left-4 z-30">
            {onToggleFeatured ? (
              <button
                type="button"
                onClick={() => onToggleFeatured(!beat.featured)}
                disabled={isTogglingFeatured}
                title={beat.featured ? t('admin.unfeature') : t('admin.feature')}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm transition-all",
                  "cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  beat.featured 
                    ? "bg-green-500/20 text-green-300 border border-green-500/30 focus:ring-green-500/50" 
                    : "bg-gray-500/20 text-gray-300 border border-gray-500/30 focus:ring-gray-500/50"
                )}
              >
                {isTogglingFeatured ? (
                  <span className="inline-block w-3 h-3 min-w-[12px] animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                ) : (
                  beat.featured ? t('admin.featured') : t('admin.normal')
                )}
              </button>
            ) : (
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
                beat.featured 
                  ? "bg-green-500/20 text-green-300 border border-green-500/30" 
                  : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
              )}>
                {beat.featured ? t('admin.featured') : t('admin.normal')}
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 relative z-20">
          {/* Title and Description */}
          <div className="mb-6">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editData.title || beat.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  className="w-full text-2xl sm:text-3xl font-bold bg-transparent border-b-2 border-border/30 focus:border-indigo-500 focus:outline-none text-foreground placeholder-muted-foreground pb-2"
                  placeholder="Beat Title"
                />
                <textarea
                  value={editData.description || beat.description || ''}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  className="w-full text-base text-muted-foreground bg-transparent border-b-2 border-border/30 focus:border-indigo-500 focus:outline-none resize-none placeholder-muted-foreground pb-2"
                  placeholder="Beat Description"
                  rows={2}
                />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {beat.title}
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {beat.description || t('admin.noDescription')}
                </p>
              </div>
            )}
          </div>

          {/* Audio Player */}
          {beat.previewUrl && (
            <div className="mb-6">
              <audio
                src={beat.previewUrl}
                controls
                preload="metadata"
                className="w-full h-12 rounded-xl"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          )}

          {/* Beat Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-3 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20">
              <div className="text-sm text-muted-foreground mb-1">{t('upload.genre')}</div>
              {isEditing ? (
                <select
                  value={editData.genre || beat.genre}
                  onChange={(e) => handleEditChange('genre', e.target.value)}
                  className="w-full text-sm font-medium text-foreground bg-transparent border-none focus:outline-none"
                >
                  {BEAT_CONFIG.genres.map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              ) : (
                <div className="text-sm font-medium text-foreground">{beat.genre}</div>
              )}
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">{t('upload.bpm')}</div>
              {isEditing ? (
                <input
                  type="number"
                  value={editData.bpm || beat.bpm}
                  onChange={(e) => handleEditChange('bpm', parseInt(e.target.value))}
                  className="w-full text-sm font-medium text-foreground bg-transparent border-none focus:outline-none text-center"
                  min="60"
                  max="200"
                />
              ) : (
                <div className="text-sm font-medium text-foreground">{beat.bpm}</div>
              )}
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
              <div className="text-sm text-muted-foreground mb-1">{t('upload.key')}</div>
              {isEditing ? (
                <select
                  value={editData.key || beat.key}
                  onChange={(e) => handleEditChange('key', e.target.value)}
                  className="w-full text-sm font-medium text-foreground bg-transparent border-none focus:outline-none"
                >
                  {BEAT_CONFIG.keys.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              ) : (
                <div className="text-sm font-medium text-foreground">{beat.key}</div>
              )}
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-xl border border-teal-500/20">
              <div className="text-sm text-muted-foreground mb-1">{t('upload.mode')}</div>
              {isEditing ? (
                <select
                  value={editData.mode ?? beat.mode ?? 'majeur'}
                  onChange={(e) => handleEditChange('mode', e.target.value)}
                  className="w-full text-sm font-medium text-foreground bg-transparent border-none focus:outline-none"
                >
                  {BEAT_CONFIG.modes.map((m) => (
                    <option key={m} value={m}>{t(`upload.mode${m === 'majeur' ? 'Majeur' : 'Mineur'}`)}</option>
                  ))}
                </select>
              ) : (
                <div className="text-sm font-medium text-foreground">
                  {(beat.mode ?? 'majeur') === 'majeur' ? t('upload.modeMajeur') : t('upload.modeMineur')}
                </div>
              )}
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20">
              <div className="text-sm text-muted-foreground mb-1">{t('upload.duration')}</div>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.duration || beat.duration}
                  onChange={(e) => handleEditChange('duration', e.target.value)}
                  className="w-full text-sm font-medium text-foreground bg-transparent border-none focus:outline-none text-center"
                  placeholder="3:24"
                />
              ) : (
                <div className="text-sm font-medium text-foreground flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  {beat.duration}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <div className="text-sm text-muted-foreground mb-3">{t('upload.tags')}</div>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(editData.tags || beat.tags || []).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm border border-indigo-500/30"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        onClick={() => {
                          const newTags = [...(editData.tags || beat.tags || [])];
                          newTags.splice(index, 1);
                          handleEditChange('tags', newTags);
                        }}
                        className="ml-1 text-indigo-300/70 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('upload.addTag')}
                    className="flex-1 px-3 py-2 bg-background/50 border border-border/30 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const newTag = input.value.trim();
                        if (newTag && !(editData.tags || beat.tags || []).includes(newTag)) {
                          const newTags = [...(editData.tags || beat.tags || []), newTag];
                          handleEditChange('tags', newTags);
                          input.value = '';
                        }
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              beat.tags && beat.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {beat.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm border border-indigo-500/30"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">{t('upload.noTags')}</p>
              )
            )}
          </div>

          {/* Pricing */}
          <div className="mb-6">
            <div className="text-sm text-muted-foreground mb-3">{t('admin.pricing')}</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                <div className="text-xs text-muted-foreground mb-1">WAV Lease</div>
                <div className="text-lg font-bold text-foreground">{beat.wavLeasePrice}€</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                <div className="text-xs text-muted-foreground mb-1">Trackout</div>
                <div className="text-lg font-bold text-foreground">{beat.trackoutLeasePrice}€</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                <div className="text-xs text-muted-foreground mb-1">Unlimited</div>
                <div className="text-lg font-bold text-foreground">{beat.unlimitedLeasePrice}€</div>
              </div>
            </div>
            
            {isEditing && (
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <label
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all",
                    editData.isExclusive ?? beat.isExclusive
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-200"
                      : "bg-background/50 border-border/50 text-muted-foreground hover:border-amber-500/30"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={editData.isExclusive ?? beat.isExclusive ?? false}
                    onChange={(e) => handleEditChange('isExclusive', e.target.checked)}
                    className="sr-only"
                  />
                  <span className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                    editData.isExclusive ?? beat.isExclusive
                      ? "border-amber-400 bg-amber-500/30"
                      : "border-muted-foreground/50 bg-transparent"
                  )}>
                    {(editData.isExclusive ?? beat.isExclusive) && (
                      <span className="text-amber-400 text-xs font-bold">✓</span>
                    )}
                  </span>
                  <span className="font-medium">{t('admin.exclusive')}</span>
                </label>
                <label
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all",
                    editData.featured ?? beat.featured
                      ? "bg-green-500/20 border-green-500/50 text-green-200"
                      : "bg-background/50 border-border/50 text-muted-foreground hover:border-green-500/30"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={editData.featured ?? beat.featured ?? false}
                    onChange={(e) => handleEditChange('featured', e.target.checked)}
                    className="sr-only"
                  />
                  <span className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                    editData.featured ?? beat.featured
                      ? "border-green-400 bg-green-500/30"
                      : "border-muted-foreground/50 bg-transparent"
                  )}>
                    {(editData.featured ?? beat.featured) && (
                      <span className="text-green-400 text-xs font-bold">✓</span>
                    )}
                  </span>
                  <span className="font-medium">{t('admin.featured')}</span>
                </label>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="mb-6">
            <div className="text-sm text-muted-foreground mb-3">{t('admin.statistics')}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-xl border border-gray-500/20">
                <Eye className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">0</div>
                <div className="text-xs text-muted-foreground">{t('admin.views')}</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-xl border border-gray-500/20">
                <Download className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">0</div>
                <div className="text-xs text-muted-foreground">{t('admin.downloads')}</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-xl border border-gray-500/20">
                <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">0</div>
                <div className="text-xs text-muted-foreground">{t('admin.purchases')}</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-xl border border-gray-500/20">
                <DollarSign className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">0€</div>
                <div className="text-xs text-muted-foreground">{t('admin.revenue')}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 relative z-30">
            {isEditing ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (onSave) onSave();
                  }}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit className="w-4 h-4 mr-2 inline" />
                  {isSaving ? t('common.saving') : t('common.save')}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (onCancel) onCancel();
                  }}
                  disabled={isSaving}
                  className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-sm px-6 py-3 rounded-xl transition-all duration-300"
                >
                  <X className="w-4 h-4 mr-2 inline" />
                  {t('common.cancel')}
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (onStartEdit) onStartEdit();
                  }}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
                >
                  <Edit className="w-4 h-4 mr-2 inline" />
                  {t('common.edit')}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (onEditFiles) onEditFiles();
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  <Upload className="w-4 h-4 mr-2 inline" />
                  {t('admin.editFiles')}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (onDelete) onDelete();
                  }}
                  disabled={isDeleting}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white text-sm px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4 mr-2 inline" />
                  {isDeleting ? t('common.deleting') : t('common.delete')}
                </motion.button>
              </>
            )}
          </div>

          {/* System Info */}
          <div className="mt-6 pt-6 border-t border-border/20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>
                <div className="font-medium mb-1">{t('admin.id')}</div>
                <div className="font-mono">{beat.id}</div>
              </div>
              <div>
                <div className="font-medium mb-1">{t('admin.createdAt')}</div>
                <div>{new Date(beat.createdAt).toLocaleDateString('fr-FR')}</div>
              </div>
              <div>
                <div className="font-medium mb-1">{t('admin.updatedAt')}</div>
                <div>{new Date(beat.updatedAt).toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
