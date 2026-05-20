'use client';

import { motion } from 'framer-motion';
import { Download, FileCheck, Waves } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

const featureIcons = [Download, FileCheck, Waves] as const;
const featureKeys = ['delivery', 'licenses', 'quality'] as const;

export function HomeFeatures() {
  const { t } = useTranslation();

  return (
    <section className="relative border-t border-white/6 bg-black/20">
      <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center md:mb-16"
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {t('home.features.label')}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {t('home.features.title')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t('home.features.description')}
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {featureKeys.map((key, index) => {
            const Icon = featureIcons[index];

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group rounded-xl border border-white/8 bg-white/[0.02] p-6 transition-colors hover:border-white/12 hover:bg-white/[0.04]"
              >
                <div className="mb-4 inline-flex rounded-lg border border-white/8 bg-white/[0.03] p-2.5 text-foreground">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 text-base font-medium text-foreground">
                  {t(`home.features.items.${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`home.features.items.${key}.description`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
