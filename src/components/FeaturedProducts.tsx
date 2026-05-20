'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useFeaturedBeats } from '@/hooks/useFeaturedBeats';
import { CatalogBeatCard } from '@/components/catalog/CatalogBeatCard';
import { CatalogBeatCardSkeleton } from '@/components/catalog/CatalogBeatCardSkeleton';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/contexts/LanguageContext';

export default function FeaturedProducts() {
  const [playingBeat, setPlayingBeat] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ currentTime: number; duration: number }>({
    currentTime: 0,
    duration: 0,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { t } = useTranslation();

  const { featuredBeats, loading } = useFeaturedBeats(4);

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

            audio.addEventListener('canplaythrough', () => {
              setPlayingBeat(beatId);
            });

            audio.addEventListener('error', () => {
              console.error('Error playing audio');
              setPlayingBeat(null);
            });

            audio.addEventListener('ended', () => {
              setPlayingBeat(null);
              setProgress({ currentTime: 0, duration: 0 });
              audioRef.current = null;
            });

            await audio.play();
          } catch (err) {
            console.error('Error playing audio:', err);
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

  const catalogLink = (
    <Button
      asChild
      variant="outline"
      size="lg"
      className="h-10 rounded-full border-white/12 bg-transparent px-5 text-sm font-medium hover:bg-white/[0.04]"
    >
      <Link href="/beats">
        {t('featured.viewAllBeats')}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );

  const sectionHeader = (
    <div className="mb-10 flex flex-col gap-6 md:mb-12 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {t('featured.badge')}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          {t('featured.title')}
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t('featured.description')}
        </p>
      </div>
      <div className="hidden shrink-0 lg:block">{catalogLink}</div>
    </div>
  );

  if (featuredBeats.length === 0 && !loading) {
    return (
      <section className="relative border-t border-white/6 pb-20 pt-16 md:pb-28 md:pt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/8 to-transparent"
        />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          {sectionHeader}
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] py-20 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {t('featured.noBeats')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative border-t border-white/6 pb-20 pt-16 md:pb-28 md:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/8 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.02)_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_70%_50%_at_50%_50%,black_20%,transparent_100%)]"
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          {sectionHeader}
        </motion.div>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4 xl:gap-6 md:mb-12">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <CatalogBeatCardSkeleton key={i} />)
            : featuredBeats.map((beat, index) => (
                <motion.div
                  key={beat.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
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
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="flex justify-center lg:hidden"
        >
          {catalogLink}
        </motion.div>
      </div>
    </section>
  );
}
