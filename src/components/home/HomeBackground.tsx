export function HomeBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.04)_1px,transparent_1px)] bg-size-[72px_72px] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,black_40%,transparent_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute left-1/2 top-0 h-[420px] w-[min(100%,900px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(255_255_255/0.06),transparent_70%)] blur-3xl" />
      <div className="absolute -right-24 top-32 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.03),transparent_70%)] blur-3xl" />
    </div>
  );
}
