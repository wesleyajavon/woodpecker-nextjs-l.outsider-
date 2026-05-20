'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Play, Pause, Music } from 'lucide-react';
import { Beat } from '@/types/beat';
import { LicenseType } from '@/types/cart';
import { cn, formatTime } from '@/lib/utils';
import AddToCartButton from '@/components/AddToCartButton';
import { useTranslation } from '@/contexts/LanguageContext';
import { BeatLicenseModal } from '@/components/catalog/BeatLicenseModal';
import { catalogCardClass } from '@/components/catalog/catalog-styles';
import type { BeatProgress } from '@/components/BeatCard';

export interface CatalogBeatCardProps {
  beat: Beat;
  layout?: 'grid' | 'list';
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

function useBeatCardState(beat: Beat) {
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('WAV_LEASE');
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [expandedLicense, setExpandedLicense] = useState<LicenseType | null>(null);
  const [mounted, setMounted] = useState(false);

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

  const licenseOptions = [
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
  ];

  return {
    selectedLicense,
    setSelectedLicense,
    showLicenseModal,
    setShowLicenseModal,
    expandedLicense,
    setExpandedLicense,
    mounted,
    getPrice,
    formatPrice,
    licenseOptions,
  };
}

function ArtworkBlock({
  beat,
  isPlaying,
  onPlayClick,
  progress,
  onSeek,
  selectedLicense,
  compact = false,
  t,
}: {
  beat: Beat;
  isPlaying: boolean;
  onPlayClick: (e: React.MouseEvent) => void;
  progress?: BeatProgress;
  onSeek?: (time: number) => void;
  selectedLicense: LicenseType;
  compact?: boolean;
  t: (key: string) => string;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-black/30',
        compact
          ? 'h-16 w-[113px] shrink-0 rounded-lg border border-white/8 sm:h-[72px] sm:w-[128px]'
          : 'aspect-[512/289] w-full border-b border-white/6',
      )}
    >
      {beat.artworkUrl ? (
        <Image
          src={beat.artworkUrl}
          alt={beat.title}
          fill
          sizes={
            compact
              ? '(max-width: 640px) 113px, 128px'
              : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px'
          }
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-white/[0.03]">
          <Music
            className={cn('text-muted-foreground/60', compact ? 'h-5 w-5' : 'h-10 w-10')}
            strokeWidth={1.25}
          />
        </div>
      )}

      {!compact && (
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-80" />
      )}

      {!compact && beat.stemsUrl && (
        <div className="absolute left-3 top-3">
          <span className="rounded-md border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
            Stems
          </span>
        </div>
      )}

      {!compact && (
        <div className="absolute right-3 top-3">
          <span className="rounded-md border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground/80 backdrop-blur-sm">
            {licenseLabels[selectedLicense]}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={onPlayClick}
        aria-label={isPlaying ? t('common.pause') : t('common.play')}
        className={cn(
          'absolute z-10 flex items-center justify-center rounded-full border border-white/15 bg-black/50 text-foreground backdrop-blur-sm transition-all',
          compact
            ? 'inset-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
            : 'bottom-3 left-3 h-9 w-9 opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
          isPlaying && 'opacity-100 border-white/25 bg-white text-black',
        )}
      >
        {isPlaying ? (
          <Pause className={cn('fill-current', compact ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5')} />
        ) : (
          <Play className={cn('fill-current', compact ? 'ml-0.5 h-3.5 w-3.5' : 'ml-0.5 h-3.5 w-3.5')} />
        )}
      </button>

      {isPlaying && progress && progress.duration > 0 && beat.previewUrl && (
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 z-10 bg-black/60 backdrop-blur-sm',
            compact ? 'px-2 py-1' : 'px-3 py-2',
          )}
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
        </div>
      )}
    </div>
  );
}

export function CatalogBeatCard({
  beat,
  layout = 'grid',
  isPlaying = false,
  onPlay,
  onPause,
  progress,
  onSeek,
}: CatalogBeatCardProps) {
  const { t } = useTranslation();
  const state = useBeatCardState(beat);

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

  const closeModal = () => {
    state.setShowLicenseModal(false);
    state.setExpandedLicense(null);
  };

  const licenseModal =
    state.mounted &&
    state.showLicenseModal &&
    createPortal(
      <BeatLicenseModal
        open={state.showLicenseModal}
        onClose={closeModal}
        selectedLicense={state.selectedLicense}
        onSelectLicense={state.setSelectedLicense}
        expandedLicense={state.expandedLicense}
        onToggleExpanded={state.setExpandedLicense}
        options={state.licenseOptions}
        formatPrice={state.formatPrice}
      />,
      document.body,
    );

  const addToCartClass =
    'h-9 rounded-lg border-white/12 bg-white text-sm font-medium text-black hover:bg-white/90 hover:text-black';

  if (layout === 'list') {
    return (
      <>
        <motion.article
          data-beat-card
          data-beat-id={beat.id}
          className={cn(catalogCardClass, 'flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4')}
          whileHover={{ y: -1 }}
          transition={{ duration: 0.2 }}
        >
          <Link
            href={`/beats/${beat.id}`}
            className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4"
          >
            <ArtworkBlock
              beat={beat}
              isPlaying={isPlaying}
              onPlayClick={handlePlay}
              progress={progress}
              onSeek={onSeek}
              selectedLicense={state.selectedLicense}
              compact
              t={t}
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-medium tracking-tight text-foreground sm:text-base">
                {beat.title}
              </h3>
              <p className="mt-0.5 truncate font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                {metaLine}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {licenseLabels[state.selectedLicense]}
                </span>
                {beat.stemsUrl && (
                  <span className="font-mono text-[10px] text-muted-foreground">Stems</span>
                )}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden min-w-[88px] text-right sm:block">
              <span className="text-base font-medium tabular-nums text-foreground">
                {state.formatPrice(state.getPrice(state.selectedLicense))}
              </span>
              <button
                type="button"
                onClick={() => state.setShowLicenseModal(true)}
                className="mt-0.5 block w-full text-right text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {t('beatCard.changeLicense')}
              </button>
            </div>
            <AddToCartButton
              beat={beat}
              licenseType={state.selectedLicense}
              variant="outline"
              size="sm"
              className={cn(addToCartClass, 'min-w-[120px] sm:min-w-[140px]')}
            />
          </div>
        </motion.article>
        {licenseModal}
      </>
    );
  }

  return (
    <>
      <motion.article
        data-beat-card
        data-beat-id={beat.id}
        className={cn(catalogCardClass, 'flex h-full flex-col')}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          href={`/beats/${beat.id}`}
          aria-label={`${t('beatCard.viewDetails')} — ${beat.title}`}
          className="relative block"
        >
          <ArtworkBlock
            beat={beat}
            isPlaying={isPlaying}
            onPlayClick={handlePlay}
            progress={progress}
            onSeek={onSeek}
            selectedLicense={state.selectedLicense}
            t={t}
          />
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
                {state.formatPrice(state.getPrice(state.selectedLicense))}
              </span>
              <button
                type="button"
                onClick={() => state.setShowLicenseModal(true)}
                className="shrink-0 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                {t('beatCard.changeLicense')}
              </button>
            </div>

            <AddToCartButton
              beat={beat}
              licenseType={state.selectedLicense}
              variant="outline"
              size="sm"
              className={cn(addToCartClass, 'w-full')}
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
      {licenseModal}
    </>
  );
}

/** @deprecated Use CatalogBeatCard */
export const HomeFeaturedBeatCard = CatalogBeatCard;
