'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/contexts/LanguageContext';

const statKeys = ['instant', 'licenses', 'quality'] as const;

const Hero = () => {
  const { t } = useTranslation();

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden pt-16 pb-24">
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1"
        >
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t('hero.eyebrow')}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mx-auto mb-6 max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
        >
          <span className="bg-linear-to-b from-white via-white to-white/45 bg-clip-text text-transparent">
            {t('hero.title')}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl"
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button asChild size="lg" className="h-11 min-w-[180px] rounded-full bg-white px-6 text-sm font-medium text-black hover:bg-white/90">
            <Link href="/beats">
              {t('hero.cta')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-11 min-w-[180px] rounded-full border-white/12 bg-transparent px-6 text-sm font-medium text-foreground hover:bg-white/[0.04]"
          >
            <Link href="/licenses">{t('hero.ctaSecondary')}</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-14 flex flex-col items-center gap-4 sm:mt-16"
        >
          <div className="h-px w-full max-w-xl bg-linear-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {statKeys.map((key, index) => (
              <span key={key} className="inline-flex items-center gap-6">
                {index > 0 && <span aria-hidden="true" className="hidden text-white/20 sm:inline">·</span>}
                {t(`hero.stats.${key}`)}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
