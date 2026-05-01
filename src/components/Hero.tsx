'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { TextRewind } from './ui/text-rewind';
import { HoverBorderGradient } from './ui/hover-border-gradient';
import { useTranslation } from '@/contexts/LanguageContext';

const Hero = () => {
  const { t } = useTranslation();
  
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 text-center text-foreground px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Main heading */}
        <div className="mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.5em] text-signal sm:text-sm"
          >
            {t('hero.eyebrow')}
          </motion.div>
          <TextRewind
            text="l.outsider"
            shadowColors={{
              first: '#22f2a6',
              second: '#3ad7ff',
              third: '#1b2b52',
              fourth: '#0a1026',
              glow: '#22f2a6',
            }}
          />
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:text-2xl"
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex justify-center"
        >
          <Link href="/beats">
            <HoverBorderGradient
              containerClassName="rounded-2xl"
              className="group signal-glow inline-flex items-center gap-3 rounded-2xl border border-primary/25 px-8 py-4 text-lg font-semibold uppercase tracking-[0.2em] backdrop-blur-lg transition-all duration-300"
              duration={1.5}
              clockwise={true}
            >
              <span>{t('hero.cta')}</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </HoverBorderGradient>
          </Link>
        </motion.div>
      </div>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-muted-foreground sm:inline-flex"
      >
        <span className="h-10 w-px bg-gradient-to-b from-primary/0 via-primary/60 to-primary/0" />
        <span className="signal-glow flex h-12 w-12 items-center justify-center rounded-full border border-primary/25 bg-background/40 backdrop-blur-md">
          <ArrowDown className="h-5 w-5 animate-bounce" />
        </span>
      </motion.div>
    </div>
  );
};

export default Hero;