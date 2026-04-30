#!/usr/bin/env tsx

import { loadPrismaEnv } from './load-prisma-env';
import { PrismaClient } from '@prisma/client';

loadPrismaEnv();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting basic content seeding...');

  try {
    // Create FAQ Categories
    console.log('📁 Creating FAQ categories...');
    
    const categories = await Promise.all([
      prisma.fAQCategory.upsert({
        where: { slug: 'licenses' },
        update: {},
        create: {
          name: 'licenses',
          slug: 'licenses',
          displayName: 'Licenses',
          icon: 'Shield',
          sortOrder: 1,
        },
      }),
      prisma.fAQCategory.upsert({
        where: { slug: 'payment' },
        update: {},
        create: {
          name: 'payment',
          slug: 'payment',
          displayName: 'Payment',
          icon: 'CreditCard',
          sortOrder: 2,
        },
      }),
      prisma.fAQCategory.upsert({
        where: { slug: 'download' },
        update: {},
        create: {
          name: 'download',
          slug: 'download',
          displayName: 'Download',
          icon: 'Download',
          sortOrder: 3,
        },
      }),
    ]);

    console.log(`✅ Created ${categories.length} FAQ categories`);

    // Create License Types
    console.log('📄 Creating license types...');
    
    const licenses = await Promise.all([
      prisma.licenseInfo.upsert({
        where: { slug: 'wav' },
        update: {},
        create: {
          name: 'wav',
          slug: 'wav',
          displayName: 'WAV Lease',
          description: 'Basic license with WAV and MP3 files',
          basePrice: 19.99,
          maxCopies: 5000,
          maxStreams: 100000,
          maxVideos: 1,
          includesStems: false,
        },
      }),
      prisma.licenseInfo.upsert({
        where: { slug: 'trackout' },
        update: {},
        create: {
          name: 'trackout',
          slug: 'trackout',
          displayName: 'Trackout Lease',
          description: 'Premium license with stems included',
          basePrice: 39.99,
          maxCopies: 10000,
          maxStreams: 250000,
          maxVideos: 3,
          includesStems: true,
        },
      }),
      prisma.licenseInfo.upsert({
        where: { slug: 'unlimited' },
        update: {},
        create: {
          name: 'unlimited',
          slug: 'unlimited',
          displayName: 'Unlimited Lease',
          description: 'Full commercial rights license',
          basePrice: 79.99,
          maxCopies: null,
          maxStreams: null,
          maxVideos: null,
          includesStems: true,
          allowsLiveProfit: true,
          allowsRadioTV: true,
          allowsSync: true,
        },
      }),
    ]);

    console.log(`✅ Created ${licenses.length} license types`);

    // Create License Features
    console.log('⚙️ Creating license features...');
    
    const features = await Promise.all([
      prisma.licenseFeature.upsert({
        where: { slug: 'files' },
        update: {},
        create: {
          name: 'Fichiers inclus',
          slug: 'files',
          category: 'files',
          wavValue: 'WAV & MP3',
          trackoutValue: 'WAV, STEMS & MP3',
          unlimitedValue: 'WAV, STEMS & MP3',
          sortOrder: 1,
        },
      }),
      prisma.licenseFeature.upsert({
        where: { slug: 'commercial' },
        update: {},
        create: {
          name: 'Usage commercial',
          slug: 'commercial',
          category: 'usage',
          wavValue: 'Yes',
          trackoutValue: 'Yes',
          unlimitedValue: 'Yes',
          sortOrder: 2,
        },
      }),
    ]);

    console.log(`✅ Created ${features.length} license features`);

    console.log('🎉 Basic content seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding content:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('💥 Seeding failed:', e);
    process.exit(1);
  });
