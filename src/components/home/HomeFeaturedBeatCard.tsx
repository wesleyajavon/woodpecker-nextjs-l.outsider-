'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Play, Pause, Music, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Beat } from '@/types/beat';
import { LicenseType } from '@/types/cart';
import { cn, formatTime } from '@/lib/utils';
import AddToCartButton from '@/components/AddToCartButton';
import { useTranslation } from '@/contexts/LanguageContext';
import type { BeatProgress } from '@/components/BeatCard';

interface HomeFeaturedBeatCardProps {
  beat: Beat;
  isPlaying?: boolean;
  onPlay?: (beatId: string, previewUrl?: string) => void;
  onPause?: (beatId: string) => void;
  progress?: BeatProgress;
  onSeek?: (time: number) => void;
}

const licenseLabels: Record<LicenseType, string> = {
  WAV_LEASE: 'WAV',
  TRACKOUT_LEASE: 'Trackout',
  UNLIMITED_LEASE: 'Unlimited',
};

export function HomeFeaturedBeatCard({
  beat,
  isPlaying = false,
  onPlay,
  onPause,
  progress,
  onSeek,
}: HomeFeaturedBeatCardProps) {
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
      case 'WAV_LEASE':
        return beat.wavLeasePrice;
      case 'TRACKOUT_LEASE':
        return beat.trackoutLeasePrice;
      case 'UNLIMITED_LEASE':
        return beat.unlimitedLeasePrice;
      default:
        return beat.wavLeasePrice;
    }
  };

  const formatPrice = (price: number): string =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPlaying) {
      onPause?.(beat.id);
    } else {
      onPlay?.(beat.id, beat.previewUrl || undefined);
    }
  };

  const modeLabel =
    (beat.mode ?? 'majeur') === 'majeur' ? t('upload.modeMajeur') : t('upload.modeMineur');

  const metaLine = [beat.genre, `${beat.bpm} BPM`, `${beat.key} ${modeLabel}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <motion.article
        data-beat-card
        data-beat-id={beat.id}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/8 bg-white/[0.02] transition-colors hover:border-white/14 hover:bg-white/[0.04]"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          href={`/beats/${beat.id}`}
          aria-label={`${t('beatCard.viewDetails')} — ${beat.title}`}
          className="relative block"
        >
          <div className="relative aspect-[512/289] w-full overflow-hidden border-b border-white/6 bg-black/30">
            {beat.artworkUrl ? (
              <Image
                src={beat.artworkUrl}
                alt={beat.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/[0.03]">
                <Music className="h-10 w-10 text-muted-foreground/60" strokeWidth={1.25} />
              </div>
            )}

            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-80" />

            <div className="absolute left-3 top-3 flex items-center gap-2">
              {beat.hasStems && (
                <span className="rounded-md border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
                  Stems
                </span>
              )}
            </div>

            <div className="absolute right-3 top-3">
              <span className="rounded-md border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground/80 backdrop-blur-sm">
                {licenseLabels[selectedLicense]}
              </span>
            </div>

            <button
              type="button"
              onClick={handlePlay}
              aria-label={isPlaying ? t('common.pause') : t('common.play')}
              className={cn(
                'absolute bottom-3 left-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 text-foreground backdrop-blur-sm transition-all',
                'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
                isPlaying && 'opacity-100 border-white/25 bg-white text-black',
              )}
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5" fill="currentColor" />
              ) : (
                <Play className="ml-0.5 h-3.5 w-3.5" fill="currentColor" />
              )}
            </button>

            {isPlaying && progress && progress.duration > 0 && beat.previewUrl && (
              <div
                className="absolute inset-x-0 bottom-0 z-10 bg-black/60 px-3 py-2 backdrop-blur-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div
                  role="progressbar"
                  aria-valuenow={progress.currentTime}
                  aria-valuemin={0}
                  aria-valuemax={progress.duration}
                  aria-label={`${formatTime(progress.currentTime)} / ${formatTime(progress.duration)}`}
                  className="h-1 cursor-pointer overflow-hidden rounded-full bg-white/15"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!onSeek) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    onSeek(pct * progress.duration);
                  }}
                >
                  <div
                    className="h-full bg-white transition-all duration-150"
                    style={{ width: `${(progress.currentTime / progress.duration) * 100}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
                  <span>{formatTime(progress.currentTime)}</span>
                  <span>{formatTime(progress.duration)}</span>
                </div>
              </div>
            )}
          </div>
        </Link>

        <div className="flex flex-1 flex-col p-4">
          <Link href={`/beats/${beat.id}`} className="mb-3 block min-w-0">
            <h3 className="truncate text-sm font-medium tracking-tight text-foreground sm:text-base">
              {beat.title}
            </h3>
            <p className="mt-1 truncate font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              {metaLine}
            </p>
          </Link>

          <div className="mt-auto space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-lg font-medium tabular-nums tracking-tight text-foreground">
                {formatPrice(getPrice(selectedLicense))}
              </span>
              <button
                type="button"
                onClick={() => setShowLicenseModal(true)}
                className="shrink-0 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                {t('beatCard.changeLicense')}
              </button>
            </div>

            <AddToCartButton
              beat={beat}
              licenseType={selectedLicense}
              variant="outline"
              size="sm"
              className="h-9 w-full rounded-lg border-white/12 bg-white text-sm font-medium text-black hover:bg-white/90 hover:text-black"
            />

            {beat.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {beat.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="max-w-[120px] truncate rounded-md border border-white/8 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
                {beat.tags.length > 2 && (
                  <span className="rounded-md border border-white/8 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                    +{beat.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.article>

      {mounted &&
        showLicenseModal &&
        createPortal(
          <AnimatePresence>
            {showLicenseModal && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
                  onClick={() => {
                    setShowLicenseModal(false);
                    setExpandedLicense(null);
                  }}
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 12 }}
                  className="fixed left-1/2 top-1/2 z-[9999] flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
                    <div className="flex shrink-0 items-center justify-between border-b border-white/8 p-4 sm:p-5">
                      <h3 className="truncate text-base font-medium text-foreground sm:text-lg">
                        {t('beatCard.selectLicense')}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLicenseModal(false);
                          setExpandedLicense(null);
                        }}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                      <div className="space-y-2">
                        {(
                          [
                            {
                              type: 'WAV_LEASE' as LicenseType,
                              title: 'WAV Lease',
                              subtitle: 'WAV & MP3',
                              price: beat.wavLeasePrice,
                            },
                            {
                              type: 'TRACKOUT_LEASE' as LicenseType,
                              title: 'Trackout Lease',
                              subtitle: 'WAV, STEMS & MP3',
                              price: beat.trackoutLeasePrice,
                            },
                            {
                              type: 'UNLIMITED_LEASE' as LicenseType,
                              title: 'Unlimited Lease',
                              subtitle: 'WAV, STEMS & MP3',
                              price: beat.unlimitedLeasePrice,
                            },
                          ] as const
                        ).map((option) => (
                          <div
                            key={option.type}
                            className={cn(
                              'rounded-lg border transition-colors',
                              selectedLicense === option.type
                                ? 'border-white/25 bg-white/[0.06]'
                                : 'border-white/8 hover:border-white/15 hover:bg-white/[0.03]',
                            )}
                          >
                            <div className="flex items-start justify-between gap-3 p-3 sm:p-4">
                              <button
                                type="button"
                                onClick={() => setSelectedLicense(option.type)}
                                className="min-w-0 flex-1 text-left"
                              >
                                <div className="mb-0.5 flex items-center gap-2">
                                  <span className="truncate text-sm font-medium text-foreground">
                                    {option.title}
                                  </span>
                                  {selectedLicense === option.type && (
                                    <Check className="h-3.5 w-3.5 shrink-0 text-foreground" />
                                  )}
                                </div>
                                <p className="truncate text-xs text-muted-foreground">{option.subtitle}</p>
                              </button>
                              <div className="flex shrink-0 items-center gap-1">
                                <span className="whitespace-nowrap text-sm font-medium tabular-nums text-foreground">
                                  {formatPrice(option.price)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedLicense(
                                      expandedLicense === option.type ? null : option.type,
                                    )
                                  }
                                  className="rounded p-1 text-muted-foreground hover:text-foreground"
                                >
                                  {expandedLicense === option.type ? (
                                    <ChevronUp className="h-3.5 w-3.5" />
                                  ) : (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <AnimatePresence>
                              {expandedLicense === option.type && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="space-y-1 border-t border-white/8 px-3 pb-3 pt-2 text-xs text-muted-foreground sm:px-4 sm:pb-4">
                                    <p>• Used for Music Recording</p>
                                    <p>
                                      • Distribute up to{' '}
                                      {option.type === 'UNLIMITED_LEASE' ? 'UNLIMITED' : option.type === 'TRACKOUT_LEASE' ? '10 000' : '5 000'}{' '}
                                      copies
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2 border-t border-white/8 p-4 sm:p-5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowLicenseModal(false);
                          setExpandedLicense(null);
                        }}
                        className="flex-1 rounded-lg px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLicenseModal(false);
                          setExpandedLicense(null);
                        }}
                        className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
                      >
                        {t('common.confirm')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
