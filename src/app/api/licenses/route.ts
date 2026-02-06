import { NextRequest, NextResponse } from 'next/server';
import { withUpstashCache } from '@/lib/cache-upstash';
import { WOODPECKER_CACHE_CONFIG } from '@/lib/cache-upstash';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration du cache pour les licences
const LICENSES_CACHE_CONFIG = {
  ttl: WOODPECKER_CACHE_CONFIG.LICENSE_DATA, // 24 hours by default
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('language') || 'fr';
  const type = searchParams.get('type') || 'all'; // all, features, single

  // Generate cache key
  const cacheKey = `woodpecker:licenses:language:${language}:type:${type}:version:1.0`;

  const data = await withUpstashCache(
    cacheKey,
    async () => {
      console.log(`[LICENSES_API] Fetching licenses data from database for language: ${language}`);

      try {
        if (type === 'features') {
          // Fetch license comparison features
          const features = await prisma.licenseFeature.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          });

          const data = {
            features: features.map(feature => ({
              name: feature.name,
              slug: feature.slug,
              description: feature.description,
              icon: feature.icon,
              category: feature.category,
              values: {
                wav: feature.wavValue,
                trackout: feature.trackoutValue,
                unlimited: feature.unlimitedValue,
              },
            })),
            cached: false,
            timestamp: new Date().toISOString(),
          };

          return data;
        } else {
          // Fetch all licenses with features
          const [licenses, features] = await Promise.all([
            prisma.licenseInfo.findMany({
              where: { isActive: true },
              orderBy: { basePrice: 'asc' },
            }),
            prisma.licenseFeature.findMany({
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            }),
          ]);

          const data = {
            licenses: {
              wav: licenses.find(l => l.slug === 'wav') ? {
                id: licenses.find(l => l.slug === 'wav')!.id,
                name: licenses.find(l => l.slug === 'wav')!.name,
                displayName: licenses.find(l => l.slug === 'wav')!.displayName,
                description: licenses.find(l => l.slug === 'wav')!.description,
                price: Number(licenses.find(l => l.slug === 'wav')!.basePrice),
                features: licenses.find(l => l.slug === 'wav')!.features,
                limitations: licenses.find(l => l.slug === 'wav')!.limitations,
                useCases: licenses.find(l => l.slug === 'wav')!.useCases,
                maxCopies: licenses.find(l => l.slug === 'wav')!.maxCopies,
                maxStreams: licenses.find(l => l.slug === 'wav')!.maxStreams,
                maxVideos: licenses.find(l => l.slug === 'wav')!.maxVideos,
                includesStems: licenses.find(l => l.slug === 'wav')!.includesStems,
                allowsLiveProfit: licenses.find(l => l.slug === 'wav')!.allowsLiveProfit,
                allowsRadioTV: licenses.find(l => l.slug === 'wav')!.allowsRadioTV,
                allowsSync: licenses.find(l => l.slug === 'wav')!.allowsSync,
              } : null,
              trackout: licenses.find(l => l.slug === 'trackout') ? {
                id: licenses.find(l => l.slug === 'trackout')!.id,
                name: licenses.find(l => l.slug === 'trackout')!.name,
                displayName: licenses.find(l => l.slug === 'trackout')!.displayName,
                description: licenses.find(l => l.slug === 'trackout')!.description,
                price: Number(licenses.find(l => l.slug === 'trackout')!.basePrice),
                features: licenses.find(l => l.slug === 'trackout')!.features,
                limitations: licenses.find(l => l.slug === 'trackout')!.limitations,
                useCases: licenses.find(l => l.slug === 'trackout')!.useCases,
                maxCopies: licenses.find(l => l.slug === 'trackout')!.maxCopies,
                maxStreams: licenses.find(l => l.slug === 'trackout')!.maxStreams,
                maxVideos: licenses.find(l => l.slug === 'trackout')!.maxVideos,
                includesStems: licenses.find(l => l.slug === 'trackout')!.includesStems,
                allowsLiveProfit: licenses.find(l => l.slug === 'trackout')!.allowsLiveProfit,
                allowsRadioTV: licenses.find(l => l.slug === 'trackout')!.allowsRadioTV,
                allowsSync: licenses.find(l => l.slug === 'trackout')!.allowsSync,
              } : null,
              unlimited: licenses.find(l => l.slug === 'unlimited') ? {
                id: licenses.find(l => l.slug === 'unlimited')!.id,
                name: licenses.find(l => l.slug === 'unlimited')!.name,
                displayName: licenses.find(l => l.slug === 'unlimited')!.displayName,
                description: licenses.find(l => l.slug === 'unlimited')!.description,
                price: Number(licenses.find(l => l.slug === 'unlimited')!.basePrice),
                features: licenses.find(l => l.slug === 'unlimited')!.features,
                limitations: licenses.find(l => l.slug === 'unlimited')!.limitations,
                useCases: licenses.find(l => l.slug === 'unlimited')!.useCases,
                maxCopies: licenses.find(l => l.slug === 'unlimited')!.maxCopies,
                maxStreams: licenses.find(l => l.slug === 'unlimited')!.maxStreams,
                maxVideos: licenses.find(l => l.slug === 'unlimited')!.maxVideos,
                includesStems: licenses.find(l => l.slug === 'unlimited')!.includesStems,
                allowsLiveProfit: licenses.find(l => l.slug === 'unlimited')!.allowsLiveProfit,
                allowsRadioTV: licenses.find(l => l.slug === 'unlimited')!.allowsRadioTV,
                allowsSync: licenses.find(l => l.slug === 'unlimited')!.allowsSync,
              } : null,
            },
            features: features.map(feature => ({
              id: feature.id,
              name: feature.name,
              slug: feature.slug,
              description: feature.description,
              icon: feature.icon,
              category: feature.category,
              wavValue: feature.wavValue,
              trackoutValue: feature.trackoutValue,
              unlimitedValue: feature.unlimitedValue,
            })),
            cached: false,
            timestamp: new Date().toISOString(),
          };

          return data;
        }
      } catch (error) {
        console.error('[LICENSES_API_ERROR]', error);
        throw error;
      }
    },
    { ttl: LICENSES_CACHE_CONFIG.ttl }
  );

  return NextResponse.json(data || { licenses: {}, features: [], error: 'Failed to fetch data' });
}

// Keep the original function for backward compatibility (for test endpoints)
export async function getLicenseData(_language: string = 'fr') {
  try {
    const [licenses, features] = await Promise.all([
      prisma.licenseInfo.findMany({
        where: { isActive: true },
        orderBy: { basePrice: 'asc' },
      }),
      prisma.licenseFeature.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    const data = {
      licenses: licenses.map(license => ({
        id: license.id,
        slug: license.slug,
        displayName: license.displayName,
        price: Number(license.basePrice),
      })),
      features: features.map(feature => ({
        name: feature.name,
        wavValue: feature.wavValue,
        trackoutValue: feature.trackoutValue,
        unlimitedValue: feature.unlimitedValue,
      })),
      cached: true,
      timestamp: new Date().toISOString(),
    };

    return data;
  } catch (error) {
    console.error('[getLicenseData_ERROR]', error);
    return {
      licenses: [],
      features: [],
      cached: false,
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch license data from database',
    };
  }
}