'use client';

import type { Beat } from '@/types/beat';
import { APP_CONFIG } from '@/config/constants';

/**
 * Converts duration string (e.g. "3:24" or "2:30") to ISO 8601 format (e.g. "PT3M24S")
 */
function durationToISO8601(duration: string): string {
  if (!duration || typeof duration !== 'string') return 'PT0S';
  const parts = duration.trim().split(':').map((p) => parseInt(p, 10) || 0);
  if (parts.length === 1) {
    return `PT${parts[0]}S`;
  }
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return `PT${minutes}M${seconds}S`;
  }
  if (parts.length >= 3) {
    const [hours, minutes, seconds] = parts;
    return `PT${hours}H${minutes}M${seconds}S`;
  }
  return 'PT0S';
}

/**
 * Ensures URL is absolute (prepends base URL if relative)
 */
function toAbsoluteUrl(url: string | null | undefined, baseUrl: string): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const base = baseUrl.replace(/\/$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}

/**
 * Builds MusicRecording schema for a single beat
 */
function buildMusicRecordingSchema(beat: Beat, baseUrl: string, beatPageUrl: string) {
  const imageUrl = toAbsoluteUrl(beat.artworkUrl, baseUrl);
  const audioUrl = toAbsoluteUrl(beat.previewUrl, baseUrl);

  const offers: Array<{ '@type': string; price: number; priceCurrency: string; url: string }> = [];
  if (beat.wavLeasePrice > 0) {
    offers.push({
      '@type': 'Offer',
      price: beat.wavLeasePrice,
      priceCurrency: 'EUR',
      url: beatPageUrl,
    });
  }
  if (beat.trackoutLeasePrice > 0) {
    offers.push({
      '@type': 'Offer',
      price: beat.trackoutLeasePrice,
      priceCurrency: 'EUR',
      url: beatPageUrl,
    });
  }
  if (beat.unlimitedLeasePrice > 0) {
    offers.push({
      '@type': 'Offer',
      price: beat.unlimitedLeasePrice,
      priceCurrency: 'EUR',
      url: beatPageUrl,
    });
  }

  const recording: Record<string, unknown> = {
    '@type': 'MusicRecording',
    '@id': `${beatPageUrl}#recording`,
    name: beat.title,
    description: beat.description || `${beat.title} - ${beat.genre} beat at ${beat.bpm} BPM`,
    genre: beat.genre,
    duration: durationToISO8601(beat.duration),
    url: beatPageUrl,
  };

  if (imageUrl) {
    recording.image = imageUrl;
  }

  if (audioUrl) {
    recording.encoding = {
      '@type': 'MediaObject',
      contentUrl: audioUrl,
      encodingFormat: 'audio/mpeg',
    };
  }

  if (offers.length > 0) {
    recording.offers = offers.length === 1 ? offers[0] : offers;
  }

  return recording;
}

/**
 * Builds ItemList JSON-LD schema for the beats catalog
 */
function buildItemListSchema(beats: Beat[], baseUrl: string) {
  const itemListElement = beats.map((beat, index) => {
    const beatPageUrl = `${baseUrl}/beats/${beat.id}`;
    const recording = buildMusicRecordingSchema(beat, baseUrl, beatPageUrl);

    return {
      '@type': 'ListItem',
      position: index + 1,
      item: recording,
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Beats Catalog',
    description: 'Professional beats for sale - Hip-Hop, Trap, Drill, Afro and more',
    numberOfItems: beats.length,
    itemListElement,
  };
}

interface BeatsStructuredDataProps {
  beats: Beat[];
}

/**
 * Injects JSON-LD structured data (ItemList + MusicRecording) for the beats catalog page.
 * Improves SEO and enables rich results in search engines.
 */
export function BeatsStructuredData({ beats }: BeatsStructuredDataProps) {
  if (!beats || beats.length === 0) return null;

  const baseUrl = APP_CONFIG.url;
  const schema = buildItemListSchema(beats, baseUrl);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
