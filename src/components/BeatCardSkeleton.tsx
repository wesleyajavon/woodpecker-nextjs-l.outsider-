'use client';

interface BeatCardSkeletonProps {
  className?: string;
}

export default function BeatCardSkeleton({ className = '' }: BeatCardSkeletonProps) {
  return (
    <div
      className={`signal-glow animate-pulse overflow-hidden rounded-xl border border-primary/15 bg-card/50 backdrop-blur-lg ${className}`}
      aria-hidden
    >
      <div className="audio-scanlines aspect-[512/289] w-full bg-gradient-to-b from-background via-card to-black ring-1 ring-primary/10" />

      <div className="px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="mb-2 h-5 w-3/4 rounded bg-muted/60" />
        <div className="h-4 w-1/2 rounded bg-muted/40" />
      </div>

      <div className="flex flex-col px-3 pb-3 pt-1 sm:px-4 sm:pb-4 sm:pt-2">
        <div className="mb-3 flex flex-wrap gap-2 sm:gap-4">
          <div className="h-4 w-12 rounded bg-muted/40" />
          <div className="h-4 w-10 rounded bg-muted/40" />
          <div className="h-4 w-14 rounded bg-muted/40" />
        </div>

        <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
          <div className="h-7 w-20 rounded bg-muted/50" />
          <div className="h-4 w-24 rounded bg-muted/40" />
        </div>

        <div className="mt-2 h-10 w-full rounded-lg bg-muted/50 sm:mt-3" />
      </div>
    </div>
  );
}
