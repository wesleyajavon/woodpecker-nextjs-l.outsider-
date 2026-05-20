import { cn } from '@/lib/utils';
import { catalogCardClass } from '@/components/catalog/catalog-styles';

interface CatalogBeatCardSkeletonProps {
  layout?: 'grid' | 'list';
}

export function CatalogBeatCardSkeleton({ layout = 'grid' }: CatalogBeatCardSkeletonProps) {
  if (layout === 'list') {
    return (
      <div
        className={cn(catalogCardClass, 'flex animate-pulse flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4')}
        aria-hidden
      >
        <div className="h-16 w-[113px] shrink-0 rounded-lg border border-white/6 bg-white/[0.04] sm:h-[72px] sm:w-[128px]" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-white/8" />
          <div className="h-3 w-1/2 rounded bg-white/5" />
        </div>
        <div className="h-9 w-full rounded-lg bg-white/8 sm:w-36" />
      </div>
    );
  }

  return (
    <div className={cn(catalogCardClass, 'animate-pulse')} aria-hidden>
      <div className="aspect-[512/289] w-full border-b border-white/6 bg-white/[0.03]" />
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <div className="h-4 w-3/4 rounded bg-white/8" />
          <div className="h-3 w-1/2 rounded bg-white/5" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-5 w-16 rounded bg-white/8" />
          <div className="h-3 w-20 rounded bg-white/5" />
        </div>
        <div className="h-9 w-full rounded-lg bg-white/8" />
      </div>
    </div>
  );
}

/** @deprecated Use CatalogBeatCardSkeleton */
export const HomeFeaturedBeatCardSkeleton = CatalogBeatCardSkeleton;
