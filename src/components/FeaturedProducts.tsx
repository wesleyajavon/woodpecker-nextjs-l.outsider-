'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Music, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useFeaturedBeats } from '@/hooks/useFeaturedBeats';
import BeatCard from '@/components/BeatCard';
import BeatCardSkeleton from '@/components/BeatCardSkeleton';
import { HoverBorderGradient } from './ui/hover-border-gradient';
import { LayoutTextFlip } from './ui/layout-text-flip';
import { useTranslation, useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

export default function FeaturedProducts() {
  const [playingBeat, setPlayingBeat] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ currentTime: number; duration: number }>({ currentTime: 0, duration: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { t } = useTranslation();
  const { language } = useLanguage();

  // Utilisation du hook personnalisé
  const { featuredBeats, loading, error: _error } = useFeaturedBeats(4);

  // Gestion de la lecture/arrêt (même logique que /beats)
  const togglePlay = useCallback(async (beatId: string, previewUrl?: string) => {
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
  }, [playingBeat]);

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

  // Space key: toggle play/pause when a beat is playing or focus is within a BeatCard
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

  if (featuredBeats.length === 0 && !loading) {
    return (
      <section className="pt-8 pb-12 md:pt-12 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
              {t('featured.title')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              {t('featured.description')}
            </p>
          </div>
          <div className="text-center py-8 md:py-16">
            <div className="text-muted-foreground text-sm md:text-lg mb-4 px-4">
              {t('featured.noBeats')}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-8 pb-12 md:pt-12 md:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full mb-6 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">{t('featured.badge')}</span>
          </motion.div>

          <motion.div className="relative mx-2 my-2 md:mx-4 md:my-4 flex flex-col items-center justify-center gap-2 md:gap-4 text-center sm:mx-0 sm:mb-0 sm:flex-row">
            <LayoutTextFlip
              text={`${t('featured.title')} `}
              words={translations[language].featured.words}
              duration={2500}
            />
          </motion.div>
          <p className="mt-3 md:mt-4 text-center text-base sm:text-lg md:text-xl text-foreground max-w-2xl mx-auto px-4">
            {t('featured.description')}
          </p>
        </motion.div>

        {/* Grid des beats - Mobile optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8 md:mb-12">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <BeatCardSkeleton key={i} />
            ))
          ) : (
            featuredBeats.map((beat, index) => (
            <motion.div
              key={beat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -5,
                scale: 1.01
              }}
              className="w-full"
            >
              <BeatCard
                beat={beat}
                isPlaying={playingBeat === beat.id}
                onPlay={togglePlay}
                onPause={togglePlay}
                progress={playingBeat === beat.id ? progress : undefined}
                onSeek={playingBeat === beat.id ? handleSeek : undefined}
                className="group relative bg-card/10 backdrop-blur-lg rounded-xl md:rounded-2xl overflow-hidden hover:bg-card/20 transition-all duration-500 w-full h-full"
              />
            </motion.div>
            ))
          )}
        </div>

        {/* CTA - Mobile optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center flex justify-center px-4"
        >
          <Link href="/beats" className="w-full sm:w-auto">
            <HoverBorderGradient
              containerClassName="rounded-xl md:rounded-2xl w-full sm:w-auto"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 w-full sm:w-auto"
              duration={1.5}
              clockwise={true}
            >
              {t('featured.viewAllBeats')}
              <Music className="w-4 h-4 md:w-5 md:h-5" />
            </HoverBorderGradient>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
