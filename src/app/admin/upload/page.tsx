'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import BeatUpload from '@/components/BeatUpload';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { TextRewind } from '@/components/ui/text-rewind';
import { cn } from '@/lib/utils';
import { Beat } from '@/types/beat';
import { useTranslation } from '@/contexts/LanguageContext';

export default function AdminUploadPage() {
  const { t } = useTranslation();
  const [uploadedBeats, setUploadedBeats] = useState<Beat[]>([]);

  const handleUploadSuccess = (beat: Beat) => {
    setUploadedBeats(prev => [beat, ...prev]);
  };

  const handleUploadError = () => {
    // Upload error handled by parent component
  };

  return (
    <div className="flex-1 pt-16 sm:pt-20 pb-4 px-3 sm:px-4 lg:px-6 relative h-screen overflow-hidden">
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

      <div className="max-w-7xl mx-auto py-2 sm:py-4 relative z-10 h-full flex flex-col">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-6 px-2"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 mt-2"
          >
            <TextRewind text={t('admin.uploadBeat')} />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {t('admin.uploadBeatDescription')}
          </motion.p>
        </motion.div>

        {/* Upload Section - Takes remaining space */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex flex-col"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Plus className="w-3 h-3 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {t('admin.uploadNewBeat')}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            <BeatUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>

          {/* Recently Uploaded Beats - Compact horizontal layout */}
          {uploadedBeats.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {t('admin.recentlyUploaded')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {uploadedBeats.slice(0, 6).map((beat, index) => (
                  <motion.div
                    key={beat.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card/10 backdrop-blur-lg rounded-lg p-3 border border-border/20"
                  >
                    <h4 className="font-semibold text-foreground mb-2 text-sm truncate">{beat.title}</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="truncate">{beat.genre} • {beat.bpm} BPM</div>
                      <div className="truncate">{beat.key} • {beat.duration}</div>
                      <div className="text-primary font-medium text-xs">
                        {beat.wavLeasePrice}€ | {beat.trackoutLeasePrice}€ | {beat.unlimitedLeasePrice}€
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}