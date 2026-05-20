'use client';

import { AlertTriangle, Clock } from 'lucide-react';
import { useTranslation, useLanguage } from '@/contexts/LanguageContext';
import TermsContent from '@/components/TermsContent';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PublicPageShell } from '@/components/home/PublicPageShell';
import { PublicPageHeader } from '@/components/home/PublicPageHeader';
import { catalogPanelClass } from '@/components/catalog/catalog-styles';
import { cn } from '@/lib/utils';

export default function TermsPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(
      new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    );
  }, [language]);

  return (
    <PublicPageShell>
      <PublicPageHeader label={t('nav.terms')} title={t('terms.title')} subtitle={t('terms.subtitle')} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={cn(catalogPanelClass, 'mb-8 flex items-center justify-center gap-3 px-5 py-4')}
      >
        <Clock className="h-4 w-4 text-muted-foreground" />
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {t('terms.lastUpdated')}: {lastUpdated}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className={cn(catalogPanelClass, 'mb-10 p-6 sm:p-8')}
      >
        <TermsContent />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className={cn(catalogPanelClass, 'p-6 sm:p-8')}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {t('terms.importantNotice')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t('terms.importantNoticeDescription')}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t('terms.questionsContact')}
              <a
                href="mailto:contact@loutsider.com"
                className="ml-1 text-foreground underline-offset-4 hover:underline"
              >
                contact@loutsider.com
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </PublicPageShell>
  );
}
