'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PublicPageShell } from '@/components/home/PublicPageShell';
import { CatalogBeatCard } from '@/components/catalog/CatalogBeatCard';
import AddToCartButton from '@/components/AddToCartButton';
import { Button } from '@/components/ui/Button';
import { catalogPanelClass } from '@/components/catalog/catalog-styles';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useApp';
import { useBeat } from '@/hooks/queries/useBeats';
import { LicenseType } from '@/types/cart';

export default function BeatDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const beatId = params?.id as string;

  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('WAV_LEASE');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState<{ currentTime: number; duration: number }>({
    currentTime: 0,
    duration: 0,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: beatData, isLoading: loading, error, refetch } = useBeat(beatId);
  const beat = beatData?.data;

  const togglePlay = useCallback(
    async (id: string, previewUrl?: string) => {
      if (!beat?.previewUrl) return;

      if (isPlaying) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        setProgress({ currentTime: 0, duration: 0 });
      } else {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        const url = previewUrl ?? beat.previewUrl;
        if (!url) return;

        try {
          const audio = new Audio(url);
          audioRef.current = audio;
          setProgress({ currentTime: 0, duration: 0 });

          audio.addEventListener('loadedmetadata', () => {
            setProgress((p) => ({ ...p, duration: audio.duration }));
          });
          audio.addEventListener('timeupdate', () => {
            setProgress((p) => ({ ...p, currentTime: audio.currentTime }));
          });
          audio.addEventListener('canplaythrough', () => setIsPlaying(true));
          audio.addEventListener('error', () => setIsPlaying(false));
          audio.addEventListener('ended', () => {
            setIsPlaying(false);
            setProgress({ currentTime: 0, duration: 0 });
            audioRef.current = null;
          });

          await audio.play();
        } catch (playError) {
          console.error('Error playing audio:', playError);
          setIsPlaying(false);
        }
      }
    },
    [beat?.previewUrl, isPlaying],
  );

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress((p) => ({ ...p, currentTime: time }));
    }
  }, []);

  const getPrice = (licenseType: LicenseType): number => {
    if (!beat) return 0;
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

  const loadingState = (
    <div className="flex min-h-[50vh] flex-col items-center justify-center py-20">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {t('beats.detail.loading')}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{t('beats.detail.loadingHint')}</p>
    </div>
  );

  const errorState = (
    <div className="py-16 text-center">
      <div className="mx-auto max-w-md rounded-xl border border-red-500/20 bg-red-500/5 p-6">
        <p className="mb-2 text-lg font-medium text-red-300">{t('beats.detail.notFound')}</p>
        <p className="mb-6 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : t('beats.detail.notFoundDescription')}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => refetch()} variant="outline" className="border-white/12">
            {t('beats.retry')}
          </Button>
          <Button asChild className="bg-white text-black hover:bg-white/90">
            <Link href="/beats">{t('beats.detail.backToBeats')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <PublicPageShell maxWidth="max-w-[1400px]">{loadingState}</PublicPageShell>;
  }

  if (error || !beat) {
    return <PublicPageShell maxWidth="max-w-[1400px]">{errorState}</PublicPageShell>;
  }

  return (
    <PublicPageShell maxWidth="max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 border-b border-white/6 pb-8"
      >
        <Button
          asChild
          variant="outline"
          size="sm"
          className="mb-6 h-9 rounded-lg border-white/12 bg-transparent hover:bg-white/[0.04]"
        >
          <Link href="/beats">
            <ArrowLeft className="h-4 w-4" />
            {t('beats.detail.backToBeats')}
          </Link>
        </Button>

        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {beat.genre}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {beat.title}
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <CatalogBeatCard
              beat={beat}
              isPlaying={isPlaying}
              onPlay={togglePlay}
              onPause={togglePlay}
              progress={isPlaying && progress.duration > 0 ? progress : undefined}
              onSeek={handleSeek}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(catalogPanelClass, 'p-6')}
          >
            <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
              {t('beats.detail.detailsTitle')}
            </h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">{t('beats.detail.genre')}</dt>
                <dd className="mt-1 text-foreground">{beat.genre}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t('beats.detail.bpm')}</dt>
                <dd className="mt-1 text-foreground">{beat.bpm}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t('beats.detail.key')}</dt>
                <dd className="mt-1 text-foreground">{beat.key}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t('beats.detail.mode')}</dt>
                <dd className="mt-1 text-foreground">
                  {(beat.mode ?? 'majeur') === 'majeur'
                    ? t('upload.modeMajeur')
                    : t('upload.modeMineur')}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t('beats.detail.duration')}</dt>
                <dd className="mt-1 text-foreground">{beat.duration}</dd>
              </div>
              {beat.stemsUrl && (
                <div>
                  <dt className="text-muted-foreground">STEMS</dt>
                  <dd className="mt-1 text-foreground">{t('beats.detail.stemsAvailable')}</dd>
                </div>
              )}
            </dl>

            {beat.description && (
              <div className="mt-6 border-t border-white/6 pt-6">
                <p className="text-sm text-muted-foreground">{t('beats.detail.description')}</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{beat.description}</p>
              </div>
            )}

            {beat.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {beat.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className={cn(catalogPanelClass, 'p-6 lg:sticky lg:top-24')}
          >
            <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
              {t('beats.detail.chooseLicense')}
            </h2>

            <div className="space-y-3">
              {(['WAV_LEASE', 'TRACKOUT_LEASE', 'UNLIMITED_LEASE'] as LicenseType[]).map(
                (license) => (
                  <button
                    key={license}
                    type="button"
                    onClick={() => setSelectedLicense(license)}
                    className={cn(
                      'w-full rounded-lg border p-3 text-left transition-colors',
                      selectedLicense === license
                        ? 'border-white/20 bg-white/[0.06]'
                        : 'border-white/10 hover:border-white/14 hover:bg-white/[0.03]',
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {license === 'WAV_LEASE'
                            ? t('licenses.wavLease')
                            : license === 'TRACKOUT_LEASE'
                              ? t('licenses.trackoutLease')
                              : t('licenses.unlimitedLease')}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {license === 'WAV_LEASE'
                            ? 'WAV & MP3'
                            : 'WAV, STEMS & MP3'}
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">{formatPrice(getPrice(license))}</p>
                    </div>
                  </button>
                ),
              )}
            </div>

            <div className="mt-6">
              <AddToCartButton beat={beat} licenseType={selectedLicense} className="w-full" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className={cn(catalogPanelClass, 'p-6')}
          >
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {t('beats.detail.similarBeats')}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('beats.detail.similarDescription')}
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-4 w-full border-white/12 hover:bg-white/[0.04]"
            >
              <Link href="/beats">
                {t('beats.detail.viewAllBeats')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </PublicPageShell>
  );
}
