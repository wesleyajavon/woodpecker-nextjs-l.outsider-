'use client';

import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { PublicPageShell } from '@/components/home/PublicPageShell';
import { PublicPageHeader } from '@/components/home/PublicPageHeader';
import { catalogPanelClass } from '@/components/catalog/catalog-styles';
import { cn } from '@/lib/utils';

export default function RecruitersPage() {
  const { t } = useTranslation();

  return (
    <PublicPageShell maxWidth="max-w-4xl">
      <PublicPageHeader
        label={t('nav.recruiters')}
        title={t('recruiters.title')}
        subtitle={t('recruiters.subtitle')}
      />

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={cn(catalogPanelClass, 'p-6 sm:p-8')}
        >
          <div className="mb-4 flex items-center gap-3">
            <PlayCircle className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {t('recruiters.userFlow.title')}
            </h2>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t('recruiters.userFlow.description')}
          </p>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10">
            <iframe
              src="https://www.youtube.com/embed/1tzYOKYfrJk"
              title={t('recruiters.userFlow.title')}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(catalogPanelClass, 'p-6 sm:p-8')}
        >
          <div className="mb-4 flex items-center gap-3">
            <PlayCircle className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {t('recruiters.adminFlow.title')}
            </h2>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t('recruiters.adminFlow.description')}
          </p>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title={t('recruiters.adminFlow.title')}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </motion.div>
      </div>
    </PublicPageShell>
  );
}
