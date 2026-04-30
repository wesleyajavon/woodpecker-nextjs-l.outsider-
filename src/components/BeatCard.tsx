'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Play, Pause, Music, Crown, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Beat } from '@/types/beat';
import { LicenseType } from '@/types/cart';
import { formatTime } from '@/lib/utils';
import AddToCartButton from './AddToCartButton';
import { useTranslation } from '@/contexts/LanguageContext';

export interface BeatProgress {
  currentTime: number;
  duration: number;
}

interface BeatCardProps {
  beat: Beat;
  isPlaying?: boolean;
  onPlay?: (beatId: string, previewUrl?: string) => void;
  onPause?: (beatId: string) => void;
  progress?: BeatProgress;
  onSeek?: (time: number) => void;
  className?: string;
}

const licenseColors = {
  WAV_LEASE: 'text-blue-400',
  TRACKOUT_LEASE: 'text-purple-400',
  UNLIMITED_LEASE: 'text-orange-400'
};

export default function BeatCard({ 
  beat, 
  isPlaying = false, 
  onPlay, 
  onPause, 
  progress,
  onSeek,
  className = '' 
}: BeatCardProps) {
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('WAV_LEASE');
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [expandedLicense, setExpandedLicense] = useState<LicenseType | null>(null);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPrice = (licenseType: LicenseType): number => {
    switch (licenseType) {
      case 'WAV_LEASE': return beat.wavLeasePrice;
      case 'TRACKOUT_LEASE': return beat.trackoutLeasePrice;
      case 'UNLIMITED_LEASE': return beat.unlimitedLeasePrice;
      default: return beat.wavLeasePrice;
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handlePlay = () => {
    if (isPlaying) {
      onPause?.(beat.id);
    } else {
      onPlay?.(beat.id, beat.previewUrl || undefined);
    }
  };

  const openLicenseModal = () => {
    setShowLicenseModal(true);
  };

  const closeLicenseModal = () => {
    setShowLicenseModal(false);
    setExpandedLicense(null);
  };

  const toggleLicenseDetails = (license: LicenseType) => {
    setExpandedLicense(expandedLicense === license ? null : license);
  };

  const isListMode = className.includes('flex items-center');

  return (
    <>
    <motion.div
      data-beat-card
      data-beat-id={beat.id}
      className={`bg-card/50 backdrop-blur-lg rounded-xl border border-border overflow-hidden hover:border-border/80 transition-all duration-300 ${className}`}
      whileHover={{ y: isListMode ? 0 : -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Liste : pochette + titre dans le lien */}
      {isListMode ? (
      <Link
        href={`/beats/${beat.id}`}
        aria-label={`${t('beatCard.viewDetails')} - ${beat.title}`}
        className="flex min-w-0 flex-1 items-center"
      >
        <div className="relative h-16 w-[113px] shrink-0 overflow-hidden rounded-lg bg-gradient-to-b from-zinc-950 via-neutral-950 to-black ring-1 ring-white/5 sm:h-20 sm:w-[142px]">
          {beat.artworkUrl ? (
            <Image
              src={beat.artworkUrl}
              alt={beat.title}
              fill
              sizes="(max-width: 640px) 113px, 142px"
              className="object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Music className="h-6 w-6 text-muted-foreground" />
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePlay();
            }}
            className="absolute inset-0 z-10 flex touch-manipulation items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity duration-300 hover:opacity-100 active:opacity-100"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 text-foreground" />
            ) : (
              <Play className="h-4 w-4 text-foreground" />
            )}
          </button>

          {isPlaying && progress && progress.duration > 0 && beat.previewUrl && (
            <div
              className="absolute bottom-0 left-0 right-0 z-10 rounded-b-lg bg-black/60 backdrop-blur-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div className="px-2 py-1.5 sm:px-3 sm:py-2">
                <div
                  role="progressbar"
                  aria-valuenow={progress.currentTime}
                  aria-valuemin={0}
                  aria-valuemax={progress.duration}
                  aria-label={`${formatTime(progress.currentTime)} / ${formatTime(progress.duration)}`}
                  className="h-1.5 cursor-pointer overflow-hidden rounded-full bg-muted/50 transition-all hover:h-2 sm:h-2 sm:hover:h-2.5"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!onSeek) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const pct = Math.max(0, Math.min(1, x / rect.width));
                    onSeek(pct * progress.duration);
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-150"
                    style={{ width: `${(progress.currentTime / progress.duration) * 100}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground sm:text-xs">
                  <span>{formatTime(progress.currentTime)}</span>
                  <span>{formatTime(progress.duration)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-2 min-w-0 flex-1 p-3">
          <h3 className="truncate text-sm font-semibold text-foreground">{beat.title}</h3>
          <p className="truncate text-xs text-muted-foreground">{beat.genre}</p>
        </div>
      </Link>
      ) : (
      <>
      {/* Grille : ratio exact des visuels 1024x578, simplifie en 512/289. */}
      <Link
        href={`/beats/${beat.id}`}
        aria-label={`${t('beatCard.viewDetails')} — ${beat.title}`}
        className="block"
      >
        <div className="relative aspect-[512/289] w-full overflow-hidden bg-gradient-to-b from-zinc-950 via-neutral-950 to-black shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ring-1 ring-white/5">
          {beat.artworkUrl ? (
            <Image
              src={beat.artworkUrl}
              alt={beat.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
              className="object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900/30 to-blue-900/30">
              <Music className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePlay();
            }}
            className="absolute inset-0 z-10 flex touch-manipulation items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 hover:opacity-100 active:opacity-100"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            {isPlaying ? (
              <Pause className="h-12 w-12 text-foreground" />
            ) : (
              <Play className="ml-1 h-12 w-12 text-foreground" />
            )}
          </button>

          <div className="absolute top-2 right-2 z-10">
            <div className={`rounded-full bg-card/80 px-2 py-1 text-xs font-medium ${licenseColors[selectedLicense]}`}>
              {selectedLicense === 'WAV_LEASE'
                ? t('licenses.wavLease')
                : selectedLicense === 'TRACKOUT_LEASE'
                  ? t('licenses.trackoutLease')
                  : t('licenses.unlimitedLease')}
            </div>
          </div>

          {beat.stemsUrl && (
            <div className="absolute top-2 left-2 z-10">
              <div className="rounded-full border border-orange-500/50 bg-orange-500/20 px-2 py-1 text-xs font-medium text-orange-300">
                {t('beatCard.stems')}
              </div>
            </div>
          )}

          {isPlaying && progress && progress.duration > 0 && beat.previewUrl && (
            <div
              className="absolute bottom-0 left-0 right-0 z-10 bg-black/60 backdrop-blur-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div className="px-2 py-1.5 sm:px-3 sm:py-2">
                <div
                  role="progressbar"
                  aria-valuenow={progress.currentTime}
                  aria-valuemin={0}
                  aria-valuemax={progress.duration}
                  aria-label={`${formatTime(progress.currentTime)} / ${formatTime(progress.duration)}`}
                  className="h-1.5 cursor-pointer overflow-hidden rounded-full bg-muted/50 transition-all hover:h-2 sm:h-2 sm:hover:h-2.5"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!onSeek) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const pct = Math.max(0, Math.min(1, x / rect.width));
                    onSeek(pct * progress.duration);
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-150"
                    style={{ width: `${(progress.currentTime / progress.duration) * 100}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground sm:text-xs">
                  <span>{formatTime(progress.currentTime)}</span>
                  <span>{formatTime(progress.duration)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-3 pt-3 sm:px-4 sm:pt-4">
          <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">{beat.title}</h3>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">{beat.genre}</p>
        </div>
      </Link>

      <div className="flex flex-col px-3 pb-3 pt-1 sm:px-4 sm:pb-4 sm:pt-2">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:gap-4 sm:text-sm">
          <span className="whitespace-nowrap">{t('beatCard.bpm', { bpm: beat.bpm.toString() })}</span>
          <span className="whitespace-nowrap">{t('beatCard.key', { key: beat.key })}</span>
          <span className="whitespace-nowrap">
            {t('beatCard.mode', {
              mode:
                (beat.mode ?? 'majeur') === 'majeur' ? t('upload.modeMajeur') : t('upload.modeMineur'),
            })}
          </span>
          <span className="whitespace-nowrap">{t('beatCard.duration', { duration: beat.duration })}</span>
        </div>

        <div className="mb-3 sm:mb-4">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-lg font-bold text-foreground sm:text-xl md:text-2xl">
              {formatPrice(getPrice(selectedLicense))}
            </span>
            <button
              type="button"
              onClick={openLicenseModal}
              className="flex flex-shrink-0 items-center gap-1 whitespace-nowrap text-xs text-purple-400 transition-colors hover:text-purple-300 sm:text-sm"
            >
              <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('beatCard.changeLicense')}</span>
            </button>
          </div>
        </div>

        <div className="mt-2 sm:mt-3">
          <AddToCartButton beat={beat} licenseType={selectedLicense} className="w-full" />
        </div>

        {beat.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 sm:mt-3">
            {beat.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="max-w-[100px] truncate rounded-full bg-muted/50 px-2 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {beat.tags.length > 3 && (
              <span className="rounded-full bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
                +{beat.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
      </>
      )}

      {/* Vue liste : métadonnées + panier */}
      {isListMode && (
        <div className="min-w-0 flex-1 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{beat.bpm}BPM</span>
              <span>•</span>
              <span>{beat.key}</span>
              <span>•</span>
              <span>
                {(beat.mode ?? 'majeur') === 'majeur' ? t('upload.modeMajeur') : t('upload.modeMineur')}
              </span>
              <span>•</span>
              <span>{beat.duration}</span>
              {beat.stemsUrl && <span className="text-orange-400">• STEMS</span>}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${licenseColors[selectedLicense].replace('text-', 'bg-')}`}
              />
              <span className="text-xs text-muted-foreground">
                {selectedLicense === 'WAV_LEASE'
                  ? 'WAV'
                  : selectedLicense === 'TRACKOUT_LEASE'
                    ? 'TRK'
                    : 'UNL'}
              </span>
              <span className="ml-2 text-sm font-bold text-foreground">
                {formatPrice(getPrice(selectedLicense))}
              </span>
            </div>
          </div>

          <div className="mt-2 flex gap-1 sm:mt-3">
            <button
              type="button"
              onClick={openLicenseModal}
              className="flex-shrink-0 p-2 text-purple-400 transition-colors hover:text-purple-300"
              title={t('beatCard.changeLicense')}
            >
              <Crown className="h-3 w-3" />
            </button>
            <AddToCartButton beat={beat} licenseType={selectedLicense} className="min-w-0 flex-1" />
          </div>
        </div>
      )}
    </motion.div>

      {/* License Selection Modal - Rendered via Portal */}
      {mounted && showLicenseModal && createPortal(
        <AnimatePresence>
          {showLicenseModal && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                onClick={closeLicenseModal}
              />
              
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-[calc(100vw-2rem)] max-w-md max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl flex flex-col h-full overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/20 flex-shrink-0">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2 truncate">
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                    <span className="truncate">{t('beatCard.selectLicense')}</span>
                  </h3>
                  <button
                    onClick={closeLicenseModal}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted/50 rounded-lg flex-shrink-0"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
                  {/* License Options */}
                  <div className="space-y-2 sm:space-y-3">
                    {/* WAV Lease */}
                    <div className={`w-full rounded-xl border-2 transition-all ${
                      selectedLicense === 'WAV_LEASE'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-border hover:border-purple-400/50 hover:bg-purple-400/5'
                    }`}>
                        <div className="flex items-start justify-between p-3 sm:p-4">
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => {
                              setSelectedLicense('WAV_LEASE');
                            }}
                            className="text-left flex-1 cursor-pointer min-w-0"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground text-sm sm:text-base truncate">WAV Lease</h4>
                              {selectedLicense === 'WAV_LEASE' && (
                                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                              )}
                            </div>
                            <p className="font-medium text-xs sm:text-sm text-foreground truncate">WAV & MP3</p>
                          </motion.div>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <span className="text-sm sm:text-lg font-bold text-foreground whitespace-nowrap">
                              {formatPrice(beat.wavLeasePrice)}
                            </span>
                            <button
                              onClick={() => toggleLicenseDetails('WAV_LEASE')}
                              className="text-muted-foreground hover:text-foreground transition-colors p-1 sm:p-2 flex-shrink-0"
                            >
                              {expandedLicense === 'WAV_LEASE' ? (
                                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                              ) : (
                                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {expandedLicense === 'WAV_LEASE' && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1 text-xs text-muted-foreground border-t border-border/50 pt-2 sm:pt-3 mt-1">
                                <p className="break-words">• Used for Music Recording</p>
                                <p className="break-words">• Distribute up to 5 000 copies</p>
                                <p className="break-words">• 100 000 Online Audio Streams</p>
                                <p className="break-words">• 1 Music Video</p>
                                <p className="break-words">• UNLIMITED Non-profit Live Performances only</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                    {/* Trackout Lease */}
                    <div className={`w-full rounded-xl border-2 transition-all ${
                      selectedLicense === 'TRACKOUT_LEASE'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-border hover:border-purple-400/50 hover:bg-purple-400/5'
                    }`}>
                        <div className="flex items-start justify-between p-3 sm:p-4">
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => {
                              setSelectedLicense('TRACKOUT_LEASE');
                            }}
                            className="text-left flex-1 cursor-pointer min-w-0"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground text-sm sm:text-base truncate">Trackout Lease</h4>
                              {selectedLicense === 'TRACKOUT_LEASE' && (
                                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                              )}
                            </div>
                            <p className="font-medium text-xs sm:text-sm text-foreground truncate">WAV, STEMS & MP3</p>
                          </motion.div>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <span className="text-sm sm:text-lg font-bold text-foreground whitespace-nowrap">
                              {formatPrice(beat.trackoutLeasePrice)}
                            </span>
                            <button
                              onClick={() => toggleLicenseDetails('TRACKOUT_LEASE')}
                              className="text-muted-foreground hover:text-foreground transition-colors p-1 sm:p-2 flex-shrink-0"
                            >
                              {expandedLicense === 'TRACKOUT_LEASE' ? (
                                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                              ) : (
                                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {expandedLicense === 'TRACKOUT_LEASE' && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1 text-xs text-muted-foreground border-t border-border/50 pt-2 sm:pt-3 mt-1">
                                <p className="break-words">• Used for Music Recording</p>
                                <p className="break-words">• Distribute up to 10 000 copies</p>
                                <p className="break-words">• 250 000 Online Audio Streams</p>
                                <p className="break-words">• 3 Music Video</p>
                                <p className="break-words">• UNLIMITED Non-profit Live Performances only</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                    {/* Unlimited Lease */}
                    <div className={`w-full rounded-xl border-2 transition-all ${
                      selectedLicense === 'UNLIMITED_LEASE'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-border hover:border-purple-400/50 hover:bg-purple-400/5'
                    }`}>
                        <div className="flex items-start justify-between p-3 sm:p-4">
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => {
                              setSelectedLicense('UNLIMITED_LEASE');
                            }}
                            className="text-left flex-1 cursor-pointer min-w-0"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground text-sm sm:text-base truncate">Unlimited Lease</h4>
                              {selectedLicense === 'UNLIMITED_LEASE' && (
                                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                              )}
                            </div>
                            <p className="font-medium text-xs sm:text-sm text-foreground truncate">WAV, STEMS & MP3</p>
                          </motion.div>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <span className="text-sm sm:text-lg font-bold text-foreground whitespace-nowrap">
                              {formatPrice(beat.unlimitedLeasePrice)}
                            </span>
                            <button
                              onClick={() => toggleLicenseDetails('UNLIMITED_LEASE')}
                              className="text-muted-foreground hover:text-foreground transition-colors p-1 sm:p-2 flex-shrink-0"
                            >
                              {expandedLicense === 'UNLIMITED_LEASE' ? (
                                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                              ) : (
                                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {expandedLicense === 'UNLIMITED_LEASE' && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1 text-xs text-muted-foreground border-t border-border/50 pt-2 sm:pt-3 mt-1">
                                <p className="break-words">• Used for Music Recording</p>
                                <p className="break-words">• Distribute up to UNLIMITED copies</p>
                                <p className="break-words">• UNLIMITED Online Audio Streams</p>
                                <p className="break-words">• UNLIMITED Music Video</p>
                                <p className="break-words">• UNLIMITED Non-profit Live Performances only</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                {/* Modal Footer */}
                <div className="flex gap-2 sm:gap-3 p-4 sm:p-6 border-t border-border/20 flex-shrink-0">
                  <button
                    onClick={closeLicenseModal}
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50 rounded-lg font-medium"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={() => {
                      // License is already selected, just close the modal
                      closeLicenseModal();
                    }}
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                  >
                    {t('common.confirm')}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
}
