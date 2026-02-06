'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Music, Crown, Star } from 'lucide-react';
import Link from 'next/link';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useApp';
import { useBeat } from '@/hooks/queries/useBeats';
import BeatCard from '@/components/BeatCard';
import AddToCartButton from '@/components/AddToCartButton';
import { LicenseType } from '@/types/cart';

export default function BeatDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const beatId = params?.id as string;

  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('WAV_LEASE');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState<{ currentTime: number; duration: number }>({ currentTime: 0, duration: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // TanStack Query hook
  const {
    data: beatData,
    isLoading: loading,
    error,
    refetch
  } = useBeat(beatId);

  const beat = beatData?.data;

  // Gestion de la lecture/arrêt
  const togglePlay = async () => {
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
      
      try {
        const audio = new Audio(beat.previewUrl);
        audioRef.current = audio;
        
        setProgress({ currentTime: 0, duration: 0 });
        
        audio.addEventListener('loadedmetadata', () => {
          setProgress((p) => ({ ...p, duration: audio.duration }));
        });
        
        audio.addEventListener('timeupdate', () => {
          setProgress((p) => ({ ...p, currentTime: audio.currentTime }));
        });
        
        audio.addEventListener('canplaythrough', () => {
          setIsPlaying(true);
        });
        
        audio.addEventListener('error', () => {
          console.error('Error playing audio');
          setIsPlaying(false);
        });
        
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          setProgress({ currentTime: 0, duration: 0 });
          audioRef.current = null;
        });
        
        await audio.play();
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
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

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress((p) => ({ ...p, currentTime: time }));
    }
  }, []);

  const getPrice = (licenseType: LicenseType): number => {
    if (!beat) return 0;
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
            <h3 className="text-lg font-semibold text-foreground mb-1">Chargement du beat...</h3>
            <p className="text-sm text-muted-foreground">Veuillez patienter</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !beat) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <DottedSurface className="size-full z-0" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-6 relative z-10"
        >
          <Music className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Beat non trouvé</h1>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : 'Ce beat n&apos;existe pas ou a été supprimé.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetch()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Réessayer
            </button>
            <Link
              href="/beats"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retour aux beats
            </Link>
          </div>
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
          className="mb-8"
        >
          <Link
            href="/beats"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux beats
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">{beat.title}</h1>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Beat Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <BeatCard
                beat={beat}
                isPlaying={isPlaying}
                onPlay={() => togglePlay()}
                onPause={() => togglePlay()}
                progress={isPlaying && progress.duration > 0 ? progress : undefined}
                onSeek={handleSeek}
                className="w-full"
              />
            </motion.div>

            {/* Beat Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card/50 backdrop-blur-lg rounded-xl border border-border p-6"
            >
              <h3 className="text-xl font-semibold text-foreground mb-4">Détails du beat</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Genre:</span>
                  <span className="ml-2 text-foreground">{beat.genre}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">BPM:</span>
                  <span className="ml-2 text-foreground">{beat.bpm}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Clé:</span>
                  <span className="ml-2 text-foreground">{beat.key}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Mode:</span>
                  <span className="ml-2 text-foreground">
                    {(beat.mode ?? 'majeur') === 'majeur' ? t('upload.modeMajeur') : t('upload.modeMineur')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Durée:</span>
                  <span className="ml-2 text-foreground">{beat.duration}</span>
                </div>
                {beat.stemsUrl && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">STEMS:</span>
                    <span className="ml-2 text-orange-400">Disponibles</span>
                  </div>
                )}
              </div>
              
              {beat.description && (
                <div className="mt-4">
                  <span className="text-muted-foreground">Description:</span>
                  <p className="mt-2 text-foreground">{beat.description}</p>
                </div>
              )}

              {beat.tags.length > 0 && (
                <div className="mt-4">
                  <span className="text-muted-foreground">Tags:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {beat.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-muted/50 text-muted-foreground text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* License Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card/50 backdrop-blur-lg rounded-xl border border-border p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-400" />
                Choisir une licence
              </h3>
              
              <div className="space-y-3">
                {(['WAV_LEASE', 'TRACKOUT_LEASE', 'UNLIMITED_LEASE'] as LicenseType[]).map((license) => (
                  <button
                    key={license}
                    onClick={() => setSelectedLicense(license)}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      selectedLicense === license
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-border hover:border-purple-400/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="font-medium text-foreground">
                          {license === 'WAV_LEASE' ? 'WAV Lease' :
                           license === 'TRACKOUT_LEASE' ? 'Trackout Lease' : 'Unlimited Lease'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {license === 'WAV_LEASE' ? 'WAV & MP3' :
                           license === 'TRACKOUT_LEASE' ? 'WAV, STEMS & MP3' : 'WAV, STEMS & MP3'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-foreground">
                          {formatPrice(getPrice(license))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <AddToCartButton
                  beat={beat}
                  licenseType={selectedLicense}
                  className="w-full"
                />
              </div>
            </motion.div>

            {/* Related Beats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card/50 backdrop-blur-lg rounded-xl border border-border p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Beats similaires
              </h3>
              <p className="text-sm text-muted-foreground">
                Découvrez d&apos;autres beats du même genre
              </p>
              <Link
                href="/beats"
                className="mt-4 inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Voir tous les beats
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
