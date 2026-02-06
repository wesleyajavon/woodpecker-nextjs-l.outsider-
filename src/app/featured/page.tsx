'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Music, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { TextRewind } from '@/components/ui/text-rewind';
import { cn } from '@/lib/utils';
import { useFeaturedBeats } from '@/hooks/queries/useBeats';
import BeatCard from '@/components/BeatCard';

export default function FeaturedBeatsPage() {
  const [playingBeat, setPlayingBeat] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // TanStack Query hook
  const {
    data: featuredData,
    isLoading: loading,
    error,
    refetch
  } = useFeaturedBeats();

  const featuredBeats = featuredData?.data || [];

  // Gestion de la lecture/arrêt
  const togglePlay = async (beatId: string, previewUrl?: string) => {
    if (playingBeat === beatId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingBeat(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      if (previewUrl) {
        try {
          const audio = new Audio(previewUrl);
          audioRef.current = audio;
          
          audio.addEventListener('canplaythrough', () => {
            setPlayingBeat(beatId);
          });
          
          audio.addEventListener('error', () => {
            console.error('Error playing audio');
            setPlayingBeat(null);
          });
          
          audio.addEventListener('ended', () => {
            setPlayingBeat(null);
            audioRef.current = null;
          });
          
          await audio.play();
        } catch (error) {
          console.error('Error playing audio:', error);
          setPlayingBeat(null);
        }
      }
    }
  };

  // Cleanup audio
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <DottedSurface className="size-full z-0" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 relative z-10"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-1">Chargement des beats en vedette...</h3>
            <p className="text-sm text-muted-foreground">Veuillez patienter</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <DottedSurface className="size-full z-0" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-6 relative z-10"
        >
          <Music className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Erreur de chargement</h1>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : 'Impossible de charger les beats en vedette.'}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <DottedSurface className="size-full z-0" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full',
            'bg-[radial-gradient(ellipse_at_center,var(--theme-gradient),transparent_50%)]',
            'blur-[30px]',
          )}
        />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Beats en Vedette</h1>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <TextRewind
              text="Découvrez notre sélection des meilleurs beats"
              className="text-lg text-muted-foreground mb-4"
            />
            <p className="text-muted-foreground">
              Une curation spéciale des beats les plus populaires et les mieux notés de notre catalogue.
            </p>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-card/50 backdrop-blur-lg rounded-xl border border-border p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground mb-1">{featuredBeats.length}</div>
            <div className="text-sm text-muted-foreground">Beats en vedette</div>
          </div>
          
          <div className="bg-card/50 backdrop-blur-lg rounded-xl border border-border p-6 text-center">
            <Music className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground mb-1">
              {new Set(featuredBeats.map(beat => beat.genre)).size}
            </div>
            <div className="text-sm text-muted-foreground">Genres différents</div>
          </div>
          
          <div className="bg-card/50 backdrop-blur-lg rounded-xl border border-border p-6 text-center">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground mb-1">
              {featuredBeats.filter(beat => beat.stemsUrl).length}
            </div>
            <div className="text-sm text-muted-foreground">Avec STEMS</div>
          </div>
        </motion.div>

        {/* Featured Beats Grid */}
        {featuredBeats.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {featuredBeats.map((beat, index) => (
              <motion.div
                key={beat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="relative"
              >
                {/* Featured Badge */}
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Vedette
                  </div>
                </div>
                
                <BeatCard
                  beat={beat}
                  isPlaying={playingBeat === beat.id}
                  onPlay={togglePlay}
                  onPause={togglePlay}
                  className="w-full"
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center py-16"
          >
            <Music className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Aucun beat en vedette</h3>
            <p className="text-muted-foreground mb-6">
              Il n&apos;y a actuellement aucun beat en vedette. Découvrez tous nos beats disponibles.
            </p>
            <Link
              href="/beats"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Voir tous les beats
            </Link>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="bg-card/50 backdrop-blur-lg rounded-xl border border-border p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Vous cherchez autre chose ?
            </h3>
            <p className="text-muted-foreground mb-6">
              Explorez notre catalogue complet de beats pour trouver le son parfait pour votre projet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/beats"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Voir tous les beats
              </Link>
              <Link
                href="/contact"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
