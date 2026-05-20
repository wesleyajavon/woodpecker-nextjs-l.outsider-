import type { ReactNode } from 'react';
import { HomeBackground } from '@/components/home/HomeBackground';
import { cn } from '@/lib/utils';

type PublicPageShellProps = {
  children: ReactNode;
  className?: string;
  maxWidth?: 'max-w-4xl' | 'max-w-6xl' | 'max-w-[1400px]';
};

export function PublicPageShell({
  children,
  className,
  maxWidth = 'max-w-6xl',
}: PublicPageShellProps) {
  return (
    <main
      className={cn(
        'relative min-h-screen overflow-hidden bg-background pb-16 pt-20',
        className,
      )}
    >
      <HomeBackground />
      <div
        className={cn(
          'container relative z-10 mx-auto px-4 sm:px-6 lg:px-8',
          maxWidth,
        )}
      >
        {children}
      </div>
    </main>
  );
}
