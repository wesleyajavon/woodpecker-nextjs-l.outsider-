import type { Metadata } from 'next';
import { Suspense } from 'react';
import { translations } from '@/lib/translations';
import { APP_CONFIG } from '@/config/constants';

// Use French metadata by default (app defaults to fr, no locale routing)
const t = translations.fr.metadata.beats;
const url = `${APP_CONFIG.url}/beats`;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  openGraph: {
    title: t.title,
    description: t.description,
    url,
    type: 'website',
  },
};

export default function BeatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
