'use client';

import { HomeBackground } from '@/components/home/HomeBackground';
import { HomeFeatures } from '@/components/home/HomeFeatures';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';

const LandingSection = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      <HomeBackground />

      <div className="relative z-10">
        <Hero />
        <HomeFeatures />
        <FeaturedProducts />
      </div>
    </section>
  );
};

export default LandingSection;
