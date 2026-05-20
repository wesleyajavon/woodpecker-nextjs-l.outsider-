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
        <div className="flex min-h-screen items-center justify-center bg-background pt-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
