import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AdminPageShellProps = {
  children: ReactNode;
  className?: string;
  maxWidth?: 'max-w-4xl' | 'max-w-6xl' | 'max-w-7xl';
};

export function AdminPageShell({
  children,
  className,
  maxWidth = 'max-w-6xl',
}: AdminPageShellProps) {
  return (
    <div
      className={cn(
        'relative flex-1 overflow-x-hidden px-3 pb-8 pt-16 sm:px-4 sm:pb-12 sm:pt-20 lg:px-8',
        className,
      )}
    >
      <div className={cn('relative z-10 mx-auto w-full py-4 sm:py-6', maxWidth)}>
        {children}
      </div>
    </div>
  );
}
