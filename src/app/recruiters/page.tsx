'use client';

import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { TextRewind } from '@/components/ui/text-rewind';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

export default function RecruitersPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <DottedSurface />
      
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

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="mb-16 mt-6">
              <TextRewind text={t('recruiters.title')} />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              {t('recruiters.subtitle')}
            </motion.p>
          </motion.div>

          {/* Videos Section */}
          <div className="space-y-12">
            {/* User Flow Video */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-card/20 backdrop-blur-xl rounded-2xl border border-border/30 p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <PlayCircle className="w-6 h-6 text-indigo-400" />
                  <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                    {t('recruiters.userFlow.title')}
                  </h2>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t('recruiters.userFlow.description')}
                </p>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-border/20">
                  <iframe
                    src="https://www.youtube.com/embed/1tzYOKYfrJk"
                    title={t('recruiters.userFlow.title')}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Admin Flow Video */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-card/20 backdrop-blur-xl rounded-2xl border border-border/30 p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <PlayCircle className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                    {t('recruiters.adminFlow.title')}
                  </h2>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t('recruiters.adminFlow.description')}
                </p>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-border/20">
                  <iframe
                    src="https://www.youtube.com/embed/Wz2JQCfJcaE"
                    title={t('recruiters.adminFlow.title')}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

