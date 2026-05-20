'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import BeatUpload from '@/components/BeatUpload';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { PublicPageHeader } from '@/components/home/PublicPageHeader';
import { catalogCardClass } from '@/components/catalog/catalog-styles';
import { cn } from '@/lib/utils';
import { Beat } from '@/types/beat';
import { useTranslation } from '@/contexts/LanguageContext';

export default function AdminUploadPage() {
  const { t } = useTranslation();
  const [uploadedBeats, setUploadedBeats] = useState<Beat[]>([]);

  const handleUploadSuccess = (beat: Beat) => {
    setUploadedBeats((prev) => [beat, ...prev]);
  };

  return (
    <AdminPageShell maxWidth="max-w-7xl" className="flex flex-col">
      <PublicPageHeader
        label={t('admin.title')}
        title={t('admin.uploadBeat')}
        subtitle={t('admin.uploadBeatDescription')}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          <BeatUpload onUploadSuccess={handleUploadSuccess} onUploadError={() => {}} />
        </div>

        {uploadedBeats.length > 0 && (
          <div className="mt-6 border-t border-white/6 pt-6">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {t('admin.recentlyUploaded')}
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {uploadedBeats.slice(0, 6).map((beat, index) => (
                <motion.div
                  key={beat.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={cn(catalogCardClass, 'p-3')}
                >
                  <h4 className="mb-2 truncate text-sm font-semibold text-foreground">{beat.title}</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="truncate">
                      {beat.genre} · {beat.bpm} BPM
                    </div>
                    <div className="truncate">
                      {beat.key} · {beat.duration}
                    </div>
                    <div className="truncate font-mono text-[10px] uppercase tracking-wide">
                      {beat.wavLeasePrice}€ · {beat.trackoutLeasePrice}€ · {beat.unlimitedLeasePrice}€
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AdminPageShell>
  );
}
