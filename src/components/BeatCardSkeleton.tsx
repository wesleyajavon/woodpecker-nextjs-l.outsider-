'use client';

interface BeatCardSkeletonProps {
  className?: string;
}

export default function BeatCardSkeleton({ className = '' }: BeatCardSkeletonProps) {
  return (
    <div
      className={`bg-card/50 backdrop-blur-lg rounded-xl border border-border overflow-hidden animate-pulse ${className}`}
      aria-hidden
    >
      {/* Artwork - square */}
      <div className="aspect-square bg-muted/50" />

      {/* Content */}
      <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-3 sm:pb-4">
        {/* Title */}
        <div className="h-5 w-3/4 rounded bg-muted/60 mb-2" />
        {/* Genre */}
        <div className="h-4 w-1/2 rounded bg-muted/40 mb-3" />

        {/* BPM/Key area */}
        <div className="flex items-center gap-2 sm:gap-4 mb-3">
          <div className="h-4 w-12 rounded bg-muted/40" />
          <div className="h-4 w-10 rounded bg-muted/40" />
          <div className="h-4 w-14 rounded bg-muted/40" />
        </div>

        {/* Price area */}
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="h-7 w-20 rounded bg-muted/50" />
          <div className="h-4 w-24 rounded bg-muted/40" />
        </div>

        {/* Button */}
        <div className="h-10 w-full rounded-lg bg-muted/50 mt-2 sm:mt-3" />
      </div>
    </div>
  );
}
