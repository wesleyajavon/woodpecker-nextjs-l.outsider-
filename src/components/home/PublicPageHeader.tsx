'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PublicPageHeaderProps = {
  label: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  className?: string;
};

export function PublicPageHeader({
  label,
  title,
  subtitle,
  meta,
  className,
}: PublicPageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('mb-10 border-b border-white/6 pb-8 sm:mb-12', className)}
    >
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {subtitle}
            </p>
          ) : null}
        </div>
        {meta ? (
          <div className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground lg:text-right">
            {meta}
          </div>
        ) : null}
      </div>
    </motion.header>
  );
}
