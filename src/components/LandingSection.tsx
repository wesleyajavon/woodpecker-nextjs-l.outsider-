'use client';

import { DottedSurface } from '@/components/ui/dotted-surface';
import { cn } from '@/lib/utils';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';

const LandingSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Dotted Surface Background with dark theme gradient effect */}
      <DottedSurface className="size-full z-0 mt-65 opacity-70" />
      <div aria-hidden="true" className="audio-scanlines pointer-events-none absolute inset-0 z-0 opacity-35" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-16 z-0 h-[34rem] w-[34rem] rounded-full border border-primary/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-28 z-0 h-[22rem] w-[22rem] rounded-full border border-primary/10" />
      
      {/* Gradient overlay - adaptatif au thème */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full opacity-90',
            'bg-[radial-gradient(ellipse_at_center,var(--theme-gradient),transparent_50%)]',
            'blur-[30px]',
          )}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,var(--theme-gradient-cool),transparent_65%)] blur-2xl"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Hero />
        <FeaturedProducts />
      </div>
    </section>
  );
};

export default LandingSection;
