'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TextRewind } from './ui/text-rewind';
import { HoverBorderGradient } from './ui/hover-border-gradient';
import { useTranslation } from '@/contexts/LanguageContext';

const Hero = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 text-center text-foreground px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Main heading */}
        <div className="mb-16">
          <TextRewind text="l.outsider" />
          {/* <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent"
          >
            Beats
          </motion.div> */}
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
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
              className="group inline-flex items-center gap-3 backdrop-blur-lg px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 border border-border/20"
              duration={1.5}
              clockwise={true}
            >
              <span>{t('hero.cta')}</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </HoverBorderGradient>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;