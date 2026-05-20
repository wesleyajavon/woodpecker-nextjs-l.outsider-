'use client';

import { useState, useRef, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useFeaturedBeats } from '@/hooks/queries/useBeats';
import { CatalogBeatCard } from '@/components/catalog/CatalogBeatCard';
import { CatalogBeatCardSkeleton } from '@/components/catalog/CatalogBeatCardSkeleton';
import { HomeBackground } from '@/components/home/HomeBackground';
import { Button } from '@/components/ui/Button';
import { catalogPanelClass } from '@/components/catalog/catalog-styles';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useApp';

export default function FeaturedBeatsPage() {
  const { t } = useTranslation();
  const [playingBeat, setPlayingBeat] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ currentTime: number; duration: number }>({
    currentTime: 0,
    duration: 0,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: featuredData, isLoading: loading, error, refetch } = useFeaturedBeats();
  const featuredBeats = useMemo(() => featuredData?.data ?? [], [featuredData?.data]);

  const genreCount = useMemo(
    () => new Set(featuredBeats.map((beat) => beat.genre).filter(Boolean)).size,
    [featuredBeats],
  );
  const stemsCount = useMemo(
    () => featuredBeats.filter((beat) => beat.stemsUrl).length,
    [featuredBeats],
  );

  const togglePlay = useCallback(
    async (beatId: string, previewUrl?: string) => {
      if (playingBeat === beatId) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setPlayingBeat(null);
        setProgress({ currentTime: 0, duration: 0 });
      } else {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        if (previewUrl) {
          try {
            const audio = new Audio(previewUrl);
            audioRef.current = audio;
            setProgress({ currentTime: 0, duration: 0 });

            audio.addEventListener('loadedmetadata', () => {
              setProgress((p) => ({ ...p, duration: audio.duration }));
            });
            audio.addEventListener('timeupdate', () => {
              setProgress((p) => ({ ...p, currentTime: audio.currentTime }));
            });
            audio.addEventListener('canplaythrough', () => setPlayingBeat(beatId));
            audio.addEventListener('error', () => setPlayingBeat(null));
            audio.addEventListener('ended', () => {
              setPlayingBeat(null);
              setProgress({ currentTime: 0, duration: 0 });
              audioRef.current = null;
            });

            await audio.play();
          } catch (playError) {
            console.error('Error playing audio:', playError);
            setPlayingBeat(null);
          }
        }
      }
    },
    [playingBeat],
  );

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress((p) => ({ ...p, currentTime: time }));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!playingBeat && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [playingBeat]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      const target = e.target as HTMLElement;
      const isTyping = target.closest('input, textarea, [contenteditable="true"]');
      if (isTyping) return;

      const focusedCard = document.activeElement?.closest('[data-beat-card]') as HTMLElement | null;
      const beatIdFromCard = focusedCard?.getAttribute('data-beat-id');

      if (playingBeat) {
        e.preventDefault();
        togglePlay(playingBeat);
        return;
      }
      if (beatIdFromCard) {
        e.preventDefault();
        const beat = featuredBeats.find((b) => b.id === beatIdFromCard);
        if (beat?.previewUrl) togglePlay(beat.id, beat.previewUrl);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playingBeat, featuredBeats, togglePlay]);

  const pageShell = (content: ReactNode) => (
    <div className="relative min-h-screen overflow-hidden bg-background pb-16 pt-20">
      <HomeBackground />
      <div className="container relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {content}
      </div>
    </div>
  );

  const pageHeader = (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 border-b border-white/6 pb-8 pt-2"
    >
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {t('featured.badge')}
      </p>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t('featured.title')}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t('featured.pageSubtitle')}
          </p>
        </div>
        {!loading && !error && featuredBeats.length > 0 && (
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground lg:text-right">
            {t('featured.beatCount', { count: String(featuredBeats.length) })}
          </p>
        )}
      </div>
    </motion.header>
  );

  const statsRow =
    !loading && !error && featuredBeats.length > 0 ? (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {[
          { label: t('featured.stats.beats'), value: featuredBeats.length },
          { label: t('featured.stats.genres'), value: genreCount },
          { label: t('featured.stats.stems'), value: stemsCount },
        ].map((stat) => (
          <div key={stat.label} className={cn(catalogPanelClass, 'px-5 py-4')}>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{stat.value}</p>
          </div>
        ))}
      </motion.div>
    ) : null;

  const ctaBlock = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mt-16 border-t border-white/6 pt-12"
    >
      <div className={cn(catalogPanelClass, 'mx-auto max-w-2xl px-6 py-8 text-center sm:px-8')}>
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {t('featured.cta.title')}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t('featured.cta.description')}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="h-11 w-full rounded-lg bg-white px-6 text-sm font-medium text-black hover:bg-white/90 sm:w-auto"
          >
            <Link href="/beats">
              {t('featured.viewAllBeats')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 w-full rounded-lg border-white/12 bg-transparent px-6 text-sm font-medium hover:bg-white/[0.04] sm:w-auto"
          >
            <Link href="/contact">{t('featured.cta.contact')}</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return pageShell(
      <>
        {pageHeader}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CatalogBeatCardSkeleton key={i} />
          ))}
        </div>
        <p className="mt-8 text-center font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {t('featured.loading')}
        </p>
      </>,
    );
  }

  if (error) {
    return pageShell(
      <>
        {pageHeader}
        <div className="py-16 text-center">
          <div className="mx-auto max-w-md rounded-xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="mb-2 text-lg font-medium text-red-300">{t('beats.errorLoading')}</p>
            <p className="mb-6 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : t('featured.errorFallback')}
            </p>
            <Button onClick={() => refetch()} variant="outline" className="border-white/12">
              {t('beats.retry')}
            </Button>
          </div>
        </div>
      </>,
    );
  }

  return pageShell(
    <>
      {pageHeader}
      {statsRow}

      {featuredBeats.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4"
        >
          {featuredBeats.map((beat, index) => (
            <motion.div
              key={beat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="h-full"
            >
              <CatalogBeatCard
                beat={beat}
                isPlaying={playingBeat === beat.id}
                onPlay={togglePlay}
                onPause={togglePlay}
                progress={playingBeat === beat.id ? progress : undefined}
                onSeek={playingBeat === beat.id ? handleSeek : undefined}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] py-20 text-center"
        >
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {t('featured.noBeats')}
          </p>
          <p className="mx-auto mb-8 max-w-md text-sm text-muted-foreground">
            {t('featured.emptyDescription')}
          </p>
          <Button
            asChild
            className="h-11 rounded-lg bg-white px-6 text-sm font-medium text-black hover:bg-white/90"
          >
            <Link href="/beats">
              {t('featured.viewAllBeats')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      )}

      {ctaBlock}
    </>,
  );
}
