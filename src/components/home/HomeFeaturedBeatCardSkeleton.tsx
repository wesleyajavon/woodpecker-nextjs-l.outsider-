export function HomeFeaturedBeatCardSkeleton() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]"
      aria-hidden
    >
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
